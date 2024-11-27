"use strict";
import { getDistribucionProductosPorProveedor, getNombreYCantidadInventario, getProductosBajoStockYRestockSugerido } from "../services/estadisticasInv.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
//Aquí van las cosas para manejar las peticiones HTTP

// Obtener el nombre del producto y la cantidad
export async function getNombreYCantidadInventarioController(req, res) {
    try {
        const [inventario, error] = await getNombreYCantidadInventario();

        if (error) {
            return handleErrorClient(res, 404, "Error al obtener el nombre y la cantidad del inventario", error);
        }

        if (!inventario || inventario.length === 0) {
            return handleSuccess(res, 204, "No hay productos en el inventario");
        }

        handleSuccess(res, 200, "Nombre y cantidad del inventario obtenidos con éxito", inventario);
    } catch (error) {
        handleErrorServer(res, 500, "Error interno del servidor", error);
    }
}

// Obtener la distribución de productos por proveedor
export async function getDistribucionProductosPorProveedorController(req, res) {
    try {
        const [productosPorProveedor, error] = await getDistribucionProductosPorProveedor();

        if (error) {
            return handleErrorClient(res, 404, "Error al obtener la distribución de productos por proveedor", error);
        }

        handleSuccess(res, 200, "Distribución de productos por proveedor obtenida con éxito", productosPorProveedor);
    } catch (error) {
        handleErrorServer(res, 500, "Error interno del servidor", error);
    }
}


// Obtener productos con bajo stock y restock sugerido
export async function getProductosBajoStockYRestockSugeridoController(req, res) {
    try {
        const [productosBajoStock, error] = await getProductosBajoStockYRestockSugerido();

        if (error) {
            return handleErrorClient(res, 404, "Error al obtener productos con bajo stock y restock sugerido", error);
        }

        if (!productosBajoStock || productosBajoStock.length === 0) {
            return handleSuccess(res, 204, "No hay productos con bajo stock");
        }

        handleSuccess(res, 200, "Productos con bajo stock y restock sugerido obtenidos con éxito", productosBajoStock);
    } catch (error) {
        handleErrorServer(res, 500, "Error interno del servidor", error);
    }
}


//Obtiene las estadísticas de inventario (total items y bajo stock)
export async function getEstadisticasInventario(req, res) {
    try {
        // Llamada a la función que obtiene las estadísticas
        const estadisticasInv = await obtenerEstadisticasInventario();

        // Verifica si la obtención de estadísticas fue exitosa
        if (!estadisticasInv) {
            return handleErrorServer(res, 500, "Error obteniendo estadísticas de inventario.");
        }

        // lowStockItems es un array y totalItems es un número
        const lowStockItems = estadisticasInv.lowStockItems || [];
        const totalItems = estadisticasInv.totalItems;

        // Crea un objeto de respuesta que incluye el total y los ítems, pero el response no funciona
        const response = {
            totalItems: totalItems,
            lowStockItems: `${lowStockItems.length} productos de ${totalItems}`,
            items: lowStockItems.map(item => ({
                id: item.id,
                nombreStock: item.nombreStock,
                cantidadStock: item.cantidadStock
            }))
        };

        // Envía la respuesta con la nueva estructura
        handleSuccess(res, 200, "Estadísticas de inventario obtenidas con éxito", estadisticasInv); 
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}


//Obtiene las estadísticas por estación
export async function getEstadisticasxEstacionController(req, res) {
    const { estacion } = req.params;
    try {
        const [estadisticas, error] = await getEstadisticasxEstacionService(estacion);

        if (error) {
            return handleErrorClient(res, 404, "Error al obtener las estadísticas por estación", error);
        }

        if (!estadisticas || estadisticas.length === 0) {
            return handleSuccess(res, 204, "No hay estadísticas registradas para la estación especificada");
        }

        handleSuccess(res, 200, "Estadísticas por estación obtenidas", estadisticas);
    } catch (error) {
        handleErrorServer(res, 500, "Error interno del servidor", error);
    }
}
