import { useState, useEffect } from 'react';

import { getAllServicios } from '@services/servicio.service.js';

const useGetServicios = () => {
    const [ servicios, setServicios ] = useState([]);

    const fetchServicios = async () => {
        try {
            const response = await getAllServicios();
            const formattedData = response.map(servicio =>({
                id: servicio.id,
                bicicleta: servicio.bicicleta,
                item: servicio.item,
                rut: servicio.rut,
                tipo: servicio.tipo,
                estado: servicio.estado,
                valor: servicio.valor,
                descripcion: servicio.descripcion,
                duracionMins: servicio.duracionMins,
                cantidad: servicio.cantidad,
                createdAt: servicio.createdAt,
                updatedAt: servicio.updatedAt
                }));
                setServicios(formattedData);
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    useEffect(() => { 
        fetchServicios(); 
    }, []);

    return { servicios, fetchServicios, setServicios };
}


export default useGetServicios;