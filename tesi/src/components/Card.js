import { React } from "react";
import imageAp from '../image/apartment.jpg'
import imageSol from '../image/solarPanel.png'
import imageEol from '../image/windTurbine.jpg'
import imageDevice from '../image/device.png'
import imageBuilding from '../image/skyscraper.png'
import imageGarage from '../image/garage.jpg'

function Card (props){

    var image=""
    switch (props.src) {
        case 1:
            image = imageAp
            break;

        case 2:
            image = imageSol
            break;

        case 3:
            image = imageEol
            break;
        
        case 4:
            image = imageDevice
            break;
            
        case 5:
            image = imageBuilding
            break;

        case 6:
            image = imageGarage
            break;

        default:
            break;
    }
    
    //ui componente    
    //vado a modificare le classi in base ai diversi stati
    return( 
        <div className="max-w-sm h-96 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img className="rounded-t-lg" src={image} alt="" style={{maxHeight:"40%",display:"block",margin:"auto"}}/>
            <div className="p-5 text-center">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white" style={{whiteSpace:"pre-line"}}>{props.title}</h5>
                <p className="mb-3 text-xl text-gray-700 dark:text-gray-400">{props.text}</p>
                <p className="mb-3 text-sm text-gray-700 dark:text-gray-400">{props.data}</p>
            </div>
        </div>
    );

};
export default Card;