import pymongo    #libreria pymongo per comunicare con MongoDB
import csv
import requests
import math                   
import time
from datetime import datetime, timedelta 

tempo = lambda: int(round(time.time() * 1000))


conn = pymongo.MongoClient("mongodb://localhost:27017/")  #connessione con MongoDB
mydb=conn['SmartBuilding']
impiatoSolare=mydb["impiantoSolare"]      #collezzione impiantoSolare
impiatoEolico=mydb["impiantoEolico"]      #collezzione impiantoSolare

edificio=mydb["edificio"]                 #collezzione edificio
appartamento=mydb["appartamento"]         #collezzione appartamneto

dataInizio = datetime(2023,4,1,0,0,0)
dataFine = datetime(2023,7,10,0,0,0)
saltoMinuti = timedelta(minutes=60)

#data che uso per ciclare
dataCorrente = dataInizio

#variabili per sapere la lunghezza massima dell'array del vento
giorni=dataFine-dataInizio
lenWind=24*giorni.days
print("range giorni " + str(giorni.days) + " - grandezza massima array wind " + str(lenWind))

#dizionario che mi conterrà gli array del vento delle singole città
wind_dict = {'Messina': [], 'Milano': [], 'Roma': [], 'Torino': []}

#url per effettuare la richiesta alle api di pvgis in base alla città
url_dict = {'Messina': 'https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?lat=38.184&lon=15.539&startyear=2020&endyear=2020&pvcalculation=1&peakpower=', 
            'Milano': 'https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?lat=45.458&lon=9.196&startyear=2020&endyear=2020&pvcalculation=1&peakpower=', 
            'Roma': 'https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?lat=41.885&lon=12.493&startyear=2020&endyear=2020&pvcalculation=1&peakpower=',
            'Torino': 'https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?lat=45.061&lon=7.685&startyear=2020&endyear=2020&pvcalculation=1&peakpower='
            }

#creazione dati per la produzione
with open('produzione2.csv',mode='w',newline='') as prod:      #apertura file .csv in modalità scrittura
    fieldnames=['idTipoHardware','idDispositivo','produzione','orario'] #headers
    #scrittura degli headers all'interno del file .csv
    writerPro=csv.DictWriter(prod,fieldnames=fieldnames)    
    writerPro.writeheader()
    #ciclo per prendere ogni singolo impianto solare dal db
    count=0
    for sol in impiatoSolare.find():
        tipoHardware=sol['tipoHardware']   #mi prendo il tipoHardware
        id=sol['id']                       #mi prendo l'id
        potenzaMax=int(sol['potenzaMax'])  #mi prendo la potenza massima
        if(isinstance(sol["idAppartamento"],int)):
            for app in appartamento.find({'id':sol["idAppartamento"]}): 
                idEd=app["idEdificio"]
                for ed in edificio.find({'id':idEd}):
                    city=ed["NomeCitta"]
        if(isinstance(sol["idEdificio"],int)):
            for ed in edificio.find({'id':sol["idEdificio"]}):
                city=ed["NomeCitta"]
        #mi prendo l'url della città e aggiungo la potenza dell'impianto e ottimizzo l'angolazione
        url = url_dict[city] + str(potenzaMax/1000) + '&loss=14&optimalinclination=1'  
        
        #effettuo la richiesta con misurazione tempo di risposta
        a1=tempo()
        response = requests.get(url)
        a2=tempo()
        tempoEs=a2-a1
        print("tempo esecuzione richiesta http " + str(tempoEs) + " - " + "richiesta n° " + str(count) + " (singolo impianto)")
        count+=1
        data = response.text
        rows = data.split('\n')
     
        data_list = [] # Creazione di una lista vuota per salvare i dati di quel impianto
        line_count=0 
        for row in rows:
            #print(row.split(','))
            #salto le prime 21 righe e le righe > di 8794  perchè contengono dati che non uso
            if line_count < 11 or line_count > 8794:
                line_count += 1
                continue
            line_count += 1
            data_dict={} #dizionario che mi conterrà i valori che mi servono    data - produzione - vento 
            if row:
                row_values = row.split(',')     #mi divido per colonne la singola riga
                #mi prendo la data e la formatto nel formato che mi serve
                data = row_values[0]
                dt = datetime.strptime(data, '%Y%m%d:%H%M')
                formatted_date = dt.strftime('%Y-%m-%d %H:%M:%S')
                dt_formatted = datetime.strptime(formatted_date, '%Y-%m-%d %H:%M:%S')
                #cambio l'anno della data
                try:
                    dt_formatted = dt_formatted.replace(year=2023)
                    dt_formatted -= timedelta(minutes=10)
                except ValueError:
                    continue
                #inserisco i dati nel dizionario solo se la data è nel range delle date che ho inserito in cima
                if(dt_formatted<dataInizio):
                    continue
                if (dt_formatted>=dataFine):
                    break
                #inserisco i dati nel dizionario e poi nella lista
                data_dict['data']=dt_formatted
                data_dict['produzione'] = row_values[1]
                data_dict['vento'] = row_values[5]
                data_list.append(data_dict)
        #per ogni dizionario nella lista carico i dati nel csv 
        for val in data_list:
            data=val['data']
            produzione=val['produzione']
            writerPro.writerow({'idTipoHardware':tipoHardware,'idDispositivo':id,'produzione':produzione,'orario':data})
            #mi prendo il vento della città per calcolare l'energia eolica
            if city in wind_dict and len(wind_dict[city]) < lenWind:
                wind_dict[city].append(val['vento'])
      

    print("grandezza array vento per messina " + str(len(wind_dict["Messina"])))
    print("grandezza array vento per milano " + str(len(wind_dict["Milano"])))
    print("grandezza array vento per roma " + str(len(wind_dict["Roma"])))
    print("grandezza array vento per torino " + str(len(wind_dict["Torino"])))
    for eol in impiatoEolico.find():
        tipoHardware=eol['tipoHardware']   #mi prendo il tipoHardware
        id=eol['id']                       #mi prendo l'id
        potenzaMax=int(eol['potenzaMax'])  #mi prendo la potenza massima
        if(isinstance(eol["idAppartamento"],int)):
            for app in appartamento.find({'id':eol["idAppartamento"]}): 
                idEd=app["idEdificio"]
                for ed in edificio.find({'id':idEd}):
                    city=ed["NomeCitta"]
        if(isinstance(eol["idEdificio"],int)):
            for ed in edificio.find({'id':eol["idEdificio"]}):
                city=ed["NomeCitta"]
        w=wind_dict[city]
        i=0
        while dataCorrente < dataFine:
            #v=w/3.6 #per passare da km/h a m/s
            v=float(w[i])
            #print(v) 
            raggio_elica=4
            area=math.pi * ((raggio_elica)**2)
            efficienza_elica=0.4
            rho=1.225 
            #     P=0.59*rho*A*Cp*v**3
            #P = produzione istantenea    ---  rho = densità dell'area in kg/m^3
            #A = area del rotore in m^2   ---  Cp = coefficiente di potenza adimensionale
            #v = velocità del vento i m/S ---  0.59 = coefficiente betz che indica la massima efficienza teorica che può essere raggiunta da un rotore
            produzione=(0.59 * rho * area * efficienza_elica *(v**3))
            produzione=round(produzione,2)
            if(produzione>potenzaMax):
                produzione=potenzaMax
            #print(str(dataCorrente)+" --- "+str(v)+" --- "+str(produzione))
            writerPro.writerow({'idTipoHardware':tipoHardware,'idDispositivo':id,'produzione':produzione,'orario':dataCorrente})
            dataCorrente+=saltoMinuti     #aggiungo alla data il salto
            i+=1
        dataCorrente = dataInizio          #finito il ciclo resetto la data a febbraio
