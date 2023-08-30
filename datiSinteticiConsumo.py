#funzione distribuzione gaussiana 
def gen_Gauss(mean,std_dev,potMax):
    # Generazione casuale del valore di consumo 
    random_consumption = np.random.normal(mean, std_dev)
    # Limitazione del valore generato
    consumption= np.clip(random_consumption, 0, potMax)
    return consumption


def distr_Gauss(dispositivo,time):
    potMax = int(dispositivo['potenzaMax']) #mi prendo la potenza massima
    mean = potMax*60/100 #per farlo diventa 0.xxx o 1.xxx
    std_dev = 100
    consumption = np.zeros(len(time))
    for i in range(len(time)):
        if(dispositivo['nome'] == "lampadario" and (time[i].hour >= 17 and time[i].hour < 22)):
            consumption[i]=gen_Gauss(mean,std_dev,potMax)
        if(dispositivo['nome'] == "tv" and ((time[i].hour >= 8 and time[i].hour < 10) or (time[i].hour >= 12 and time[i].hour < 14) or (time[i].hour >= 17 and time[i].hour < 22)) ):
            consumption[i]=gen_Gauss(mean,std_dev,potMax)
        if(dispositivo['nome'] == "lavatrice" and (time[i].hour >= 18 and time[i].hour < 20)):
            consumption[i]=gen_Gauss(mean,std_dev,potMax)
        if(dispositivo['nome'] == "phon" and ((time[i].hour == 10 and time[i].minute >=10 and time[i].hour == 10 and time[i].minute <20) or (time[i].hour == 15 and time[i].minute >=10 and time[i].hour == 15 and time[i].minute <20))):
            consumption[i]=gen_Gauss(mean,std_dev,potMax)
        if(dispositivo['nome'] == "computer" and ((time[i].hour >= 10 and time[i].hour < 13) or (time[i].hour >= 14 and time[i].hour < 19) or (time[i].hour >= 21 and time[i].hour < 23)) ):
            consumption[i]=gen_Gauss(mean,std_dev,potMax)
        if(dispositivo['tipoHardware'] == 5 and (time[i].hour >= 22 or time[i].hour < 6)):
            consumption[i]=gen_Gauss(mean,1000,potMax)
    return consumption


def distr_Uniforme(dispositivo,time):
    max = int(dispositivo['potenzaMax'])
    min = max*10/100
    consumption = np.random.uniform(min, max, len(time))
    consumption = np.clip(consumption, min, max)
    return consumption


import pymongo    #libreria pymongo per comunicare con MongoDB
from datetime import datetime, timedelta 
import csv        #libreria per la gestione dei file .csv
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

conn = pymongo.MongoClient("mongodb://localhost:27017/")  #connessione con MongoDB
mydb=conn['SmartBuilding']                                #connessione al db SmartBuilding ecc

elettrodomestico=mydb["elettrodomestico"] #collezzione elettrodomestico
sensore=mydb["sensore"]                   #collezzione sensore
wallbox=mydb["wallbox"]                   #collezzione wallbox
Consumo=mydb["consumo"]                   #collezzione wallbox

#per vedere quanto ci mette a fare tutte le operazioni
#obj = datetime.now()
#obj1= obj.strftime("%H:%M:%S")
#print("Sono le:", obj1)

#svuoto csv consumo e produzione
with open('consumo.csv',mode='w') as csv_file:      #apertura file .csv in modalità scrittura
    csv_file.write('')


#cancella tutti i document di consumo e produzione nel db
#Consumo.delete_many({})
#Produzione.delete_many({})


# Creazione dell'array dei timestamp
start_date = '2023-04-01 00:00:00'
end_date = '2023-07-09 23:50:00'
freq = '10min'
time = pd.date_range(start=start_date, end=end_date, freq=freq)

#creazione dati per il consumo
with open('consumo.csv',mode='w',newline='') as csv_file:            #apertura file .csv in modalità scrittura
    fieldnames=['idTipoHardware','idDispositivo','consumo','orario'] #headers
    #scrittura degli headers all'interno del file .csv
    writer=csv.DictWriter(csv_file,fieldnames=fieldnames)    
    writer.writeheader()
    
    #ciclo per prendere ogni singolo elettrodomestico dal db
    for elett in elettrodomestico.find():  
        tipoHardware=elett['tipoHardware']   #mi prendo il tipoHardware
        id=elett['id']                       #mi prendo l'id
        if elett['nome']=="frigo":
            consumo=distr_Uniforme(elett,time)
        else:
            consumo=distr_Gauss(elett,time)
        for cons,date in zip(consumo,time):
            writer.writerow({'idTipoHardware':tipoHardware,'idDispositivo':id,'consumo':int(cons),'orario':date})

    #ciclo per prendere ogni singolo sensore dal db
    for sens in sensore.find():
        tipoHardware=sens['tipoHardware']  #mi prendo il tipoHardware
        id=sens['id']                      #mi prendo l'id
        consumo=distr_Uniforme(sens,time)
        for cons,date in zip(consumo,time):
            writer.writerow({'idTipoHardware':tipoHardware,'idDispositivo':id,'consumo':int(cons),'orario':date})

    #ciclo per prendere ogni singola wallbox dal db
    for wbox in wallbox.find():
        tipoHardware=wbox['tipoHardware']  #mi prendo il tipoHardware
        id=wbox['id']                      #mi prendo l'id
        consumo=distr_Gauss(wbox,time)
        for cons,date in zip(consumo,time):
            writer.writerow({'idTipoHardware':tipoHardware,'idDispositivo':id,'consumo':int(cons),'orario':date})





#inserisco i dati su mongodb
with open('consumo.csv',mode='r',newline='') as csv_file:  
        csv_reader = csv.reader(csv_file,delimiter=',') #ci prendiamo tutte le righe del file .csv
        line_count=0 
        #ciclo per prendere le singole righe del file .csv
        for row in csv_reader:
            #non consideriamo gli headers
            if line_count==0:
                line_count+=1
                continue
            #inserimento di un documento all'interno della collezione chiamata
            Consumo.insert_one({
                'idTipoHardware':int(row[0]),  #prendiamo il dato della colonna 0 del file .csv
                'idDispositivo':int(row[1]),  #prendiamo il dato dalla colonna 1 del file .csv
                'consumo':int(row[2]), #prendiamo il dato dalla colonna 2 del file .csv
                'orario':datetime.fromisoformat(row[3])
            })        



print("insert completed")
#per vedere quanto ci mette a fare tutte le operazioni
#obj = datetime.now()
#obj1= obj.strftime("%H:%M:%S")
#print(" alle:", obj1)
