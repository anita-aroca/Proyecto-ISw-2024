"use strict";
import { AppDataSource } from "../config/configDb.js";
import Inventario from "../entity/inventario.entity.js";
import HistorialInventario from "../entity/historialInventario.entity.js";

//Servicio para obtener el nombre del producto y la cantidad
export async function getNombreYCantidadInventario() {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);

        const inventario = await inventarioRepository.find({
            select: ["nombreStock", "cantidadStock"]
        });

        return [inventario, null];
    } catch (error) {
        console.error("Error al obtener el nombre y la cantidad del inventario:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener el nombre del producto y la cantidad filtrado por día, mes y año
export async function getInventarioNombreCantidadDia(dia, mes, year){
    try {
        const historialRepository = AppDataSource.getRepository(HistorialInventario);

        const inventarioNombreCantidadDia = await historialRepository.createQueryBuilder("historial")
            .select("inventario.nombreStock", "nombre")
            .addSelect("historial.cantidad", "cantidad")
            .addSelect("historial.createdAt", "fecha")
            .innerJoin("inventario", "inventario", "historial.id_inventario = inventario.id")
            .where("EXTRACT(DAY FROM historial.createdAt) = :dia", { dia })
            .andWhere("EXTRACT(MONTH FROM historial.createdAt) = :mes", { mes })
            .andWhere("EXTRACT(YEAR FROM historial.createdAt) = :year", { year })
            .andWhere("inventario.cantidadStock > 0")
                .andWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select("MAX(subHistorial.createdAt)")
                        .from(HistorialInventario, "subHistorial")
                        .where("subHistorial.id_inventario = historial.id_inventario")
                        .andWhere("EXTRACT(DAY FROM subHistorial.createdAt) = :dia", { dia })
                        .andWhere("EXTRACT(MONTH FROM subHistorial.createdAt) = :mes", { mes })
                        .andWhere("EXTRACT(YEAR FROM subHistorial.createdAt) = :year", { year })
                    .getQuery();
                return `historial.createdAt = (${subQuery})`;
                })
            .getRawMany();


    
        return [inventarioNombreCantidadDia, null];
    } catch (error) {
        console.error("Error al obtener nombre de stock de inventario y cantidad filtrado por día, mes y año:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener nombre de stock inventario, cantidad del historial filtrado por mes y año
export async function getInventarioNombreCantidadMesYear(mes, year) {
    try {
        const historialRepository = AppDataSource.getRepository(HistorialInventario);

        const inventarioNombreCantidad = await historialRepository.createQueryBuilder("historial")
            .select("inventario.nombreStock", "nombre") 
            .addSelect("historial.cantidad", "cantidad")
            .addSelect("historial.createdAt", "fecha") 
            .innerJoin("inventario", "inventario", "historial.id_inventario = inventario.id")
            .where("EXTRACT(MONTH FROM historial.createdAt) = :mes", { mes })
            .andWhere("EXTRACT(YEAR FROM historial.createdAt) = :year", { year })
            .andWhere("inventario.cantidadStock > 0")
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                .select("MAX(subHistorial.createdAt)") 
                .from(HistorialInventario, "subHistorial")
                .where("subHistorial.id_inventario = historial.id_inventario")
                .andWhere("EXTRACT(MONTH FROM subHistorial.createdAt) = :mes", { mes })
                .andWhere("EXTRACT(YEAR FROM subHistorial.createdAt) = :year", { year })
                .getQuery();
            return `historial.createdAt = (${subQuery})`;
            })
            .getRawMany();

        return [inventarioNombreCantidad, null];
    } catch (error) {
        console.error("Error al obtener nombre de stock de inventario y cantidad filtrado por mes y año:", error); 
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener nombre de stock inventario, cantidad del historial filtrado por año
export async function getInventarioNombreCantidadYear(year) {
    try {
        const historialRepository = AppDataSource.getRepository(HistorialInventario);

        const inventarioNombreCantidadYear = await historialRepository.createQueryBuilder("historial")
            .select("inventario.nombreStock", "nombre")
            .addSelect("historial.cantidad", "cantidad")
            .addSelect("historial.createdAt", "fecha") 
            .innerJoin("inventario", "inventario", "historial.id_inventario = inventario.id")
            .where("EXTRACT(YEAR FROM historial.createdAt) = :year", { year })
            .andWhere("inventario.cantidadStock > 0")
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select("MAX(subHistorial.createdAt)") 
                    .from(HistorialInventario, "subHistorial")
                    .where("subHistorial.id_inventario = historial.id_inventario")
                    .andWhere("EXTRACT(YEAR FROM subHistorial.createdAt) = :year", { year })
                    .getQuery();
                return `historial.createdAt = (${subQuery})`;
            })
            .getRawMany();

        return [inventarioNombreCantidadYear, null];
    } catch (error) {
        console.error("Error al obtener nombre de stock de inventario y cantidad filtrado por año:", error); 
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener nombre de stock inventario, cantidad del historial filtrado por últimos 3 meses sin contar actual
export async function getInventarioNombreCantidadUltimosTresMeses() {
    try {
        const historialRepository = AppDataSource.getRepository(HistorialInventario);
        
        const inventarioNombreCantidadUltimosTresMeses = await historialRepository.createQueryBuilder("historial")
            .select("inventario.nombreStock", "nombre")
            .addSelect("historial.cantidad", "cantidad")
            .addSelect("TO_CHAR(historial.createdAt, 'Month')", "mes")
            .addSelect("historial.createdAt", "fecha")
            .innerJoin("inventario", "inventario", "historial.id_inventario = inventario.id")
            .where("historial.createdAt >= DATE_TRUNC('month', NOW()) - INTERVAL '3 months'")
            .andWhere("historial.createdAt < DATE_TRUNC('month', NOW())")
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select("MAX(subHistorial.createdAt)")
                    .from(HistorialInventario, "subHistorial")
                    .where("subHistorial.id_inventario = historial.id_inventario")
                    .andWhere("subHistorial.createdAt >= DATE_TRUNC('month', NOW()) - INTERVAL '3 months'")
                    .andWhere("subHistorial.createdAt < DATE_TRUNC('month', NOW())")
                    .getQuery();
                return `historial.createdAt = ${subQuery}`;
            })
            .getRawMany();


    return [inventarioNombreCantidadUltimosTresMeses, null];
    } catch (error) {
        console.error("Error al obtener nombre de stock de inventario y cantidad filtrado por los últimos 3 meses:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener la distribución de productos por proveedor
export async function getDistribucionProductosPorProveedor() {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);

        const productosPorProveedor = await inventarioRepository.createQueryBuilder("inventario")
            .select("inventario.nombre_proveedor, COUNT(*) as cantidad")
            .groupBy("inventario.nombre_proveedor")
            .getRawMany();

        return [productosPorProveedor, null];
    } catch (error) {
        console.error("Error al obtener la distribución de productos por proveedor:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener productos por proveedor y cantidad filtrado por día, mes y año
export async function getInventarioProveedorDia(dia, mes, year) {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);

        const inventarioProveedorDia = await inventarioRepository.createQueryBuilder("inventario")
        .select("inventario.nombre_proveedor, COUNT(*) as cantidad")
        .where("EXTRACT(DAY FROM inventario.createdAt) = :dia", { dia })
        .andWhere("EXTRACT(MONTH FROM inventario.createdAt) = :mes", { mes })
        .andWhere("EXTRACT(YEAR FROM inventario.createdAt) = :year", { year })
        .groupBy("inventario.nombre_proveedor")
        .getRawMany();

        return [inventarioProveedorDia, null];
    } catch (error) {
        console.error("Error al obtener el nombre del proveedor y la cantidad por día, mes y año:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener productos por proveedor y cantidad filtrado por mes y año
export async function getInventarioProveedorMesYear(mes, year) {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);
        
        const inventarioProveedorMesYear = await inventarioRepository.createQueryBuilder("inventario")
        .select("inventario.nombre_proveedor, COUNT(*) as cantidad")
        .where("EXTRACT(MONTH FROM inventario.createdAt) = :mes", { mes })
        .andWhere("EXTRACT(YEAR FROM inventario.createdAt) = :year", { year })
        .groupBy("inventario.nombre_proveedor")
        .getRawMany();
    
        return [inventarioProveedorMesYear, null];
    } catch (error) {
        console.error("Error al obtener el nombre del proveedor y la cantidad por mes y año:", error);
        return [null, "Error interno del servidor"];
    }
} 

//Servicio para obtener productos por proveedor y cantidad filtrado por año
export async function getInventarioProveedorYear(year) {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);

        const inventarioProveedorYear = await inventarioRepository.createQueryBuilder("inventario")
        .select("inventario.nombre_proveedor, COUNT(*) as cantidad")
        .where("EXTRACT(YEAR FROM inventario.createdAt) = :year", { year })
        .groupBy("inventario.nombre_proveedor")
        .getRawMany();

        return [inventarioProveedorYear, null];
    } catch (error) {
        console.error("Error al obtener el nombre del proveedor y la cantidad por año:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener productos por proveedor y cantidad filtrado por los últimos 3 meses sin contar el actual
export async function getInventarioProveedorUltimosTresMeses() {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);

        const inventarioProveedorUltimosTresMeses = await inventarioRepository.createQueryBuilder("inventario")
        .select("inventario.nombre_proveedor, COUNT(*) as cantidad")
        .addSelect("TO_CHAR(inventario.createdAt, 'Month')", "mes")
        .where("inventario.createdAt >= DATE_TRUNC('month', NOW()) - INTERVAL '3 months'")
        .andWhere("inventario.createdAt < DATE_TRUNC('month', NOW())")
        .groupBy("inventario.nombre_proveedor, TO_CHAR(inventario.createdAt, 'Month')")
        .getRawMany();

        return [inventarioProveedorUltimosTresMeses, null];
    } catch (error) {
        console.error("Error al obtener el nombre del proveedor y la cantidad por los últimos 3 meses:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener productos con bajo stock y restock sugerido, con umbralMinimo
export async function getProductosBajoStockYRestockSugerido() {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);

        const productosBajoStock = await inventarioRepository.createQueryBuilder("inventario")
        .select(["inventario.nombreStock", "inventario.cantidadStock", "inventario.restockSugerido", "inventario.umbralMinimo"])
        .where("inventario.cantidadStock < inventario.umbralMinimo")
        .getMany();

        return [productosBajoStock, null];

    } catch (error) {
        console.error("Error al obtener productos con bajo stock y restock sugerido:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener productos con bajo stock y restock sugerido filtrado por día, mes y año
export async function getInventarioBajoStockRestockDia(dia, mes, year) {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);

        const inventarioBajoStockRestockDia = await inventarioRepository.createQueryBuilder("inventario")
        .select(["inventario.nombreStock", "inventario.cantidadStock", "inventario.restockSugerido", "inventario.umbralMinimo"])
        .where("inventario.cantidadStock < inventario.umbralMinimo")
        .andWhere("EXTRACT(DAY FROM inventario.createdAt) = :dia", { dia })
        .andWhere("EXTRACT(MONTH FROM inventario.createdAt) = :mes", { mes })
        .andWhere("EXTRACT(YEAR FROM inventario.createdAt) = :year", { year })
        .getMany();

        return [inventarioBajoStockRestockDia, null];
    } catch (error) {
        console.error("Error al obtener productos con bajo stock y restock sugerido por día, mes y año:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener productos con bajo stock y restock sugerido filtrado por mes y año
export async function getInventarioBajoStockRestockMesYear(mes, year) {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);

        const inventarioBajoStockRestockMesYear = await inventarioRepository.createQueryBuilder("inventario")
        .select(["inventario.nombreStock", "inventario.cantidadStock", "inventario.restockSugerido", "inventario.umbralMinimo"])
        .where("inventario.cantidadStock < inventario.umbralMinimo")
        .andWhere("EXTRACT(MONTH FROM inventario.createdAt) = :mes", { mes })
        .andWhere("EXTRACT(YEAR FROM inventario.createdAt) = :year", { year })
        .getMany();

        return [inventarioBajoStockRestockMesYear, null];
    } catch (error) {
        console.error("Error al obtener productos con bajo stock y restock sugerido por mes y año:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener productos con bajo stock y restock sugerido filtrado por año
export async function getInventarioBajoStockRestockYear(year) {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);

        const inventarioBajoStockRestockYear = await inventarioRepository.createQueryBuilder("inventario")
        .select(["inventario.nombreStock", "inventario.cantidadStock", "inventario.restockSugerido", "inventario.umbralMinimo"])
        .where("inventario.cantidadStock < inventario.umbralMinimo")
        .andWhere("EXTRACT(YEAR FROM inventario.createdAt) = :year", { year })
        .getMany();

        return [inventarioBajoStockRestockYear, null];
    } catch (error) {
        console.error("Error al obtener productos con bajo stock y restock sugerido por año:", error);
        return [null, "Error interno del servidor"];
    }
}

//Servicio para obtener productos con bajo stock y restock sugerido filtrado por los últimos 3 meses sin contar el actual
export async function getInventarioBajoStockRestockUltimosTresMeses() {
    try {
        const inventarioRepository = AppDataSource.getRepository(Inventario);

        const inventarioBajoStockRestockUltimosTresMeses = await inventarioRepository.createQueryBuilder("inventario")
        .select(["inventario.nombreStock", "inventario.cantidadStock", "inventario.restockSugerido", "inventario.umbralMinimo"])
        .addSelect("TO_CHAR(inventario.createdAt, 'Month')", "mes")
        .where("inventario.cantidadStock < inventario.umbralMinimo")
        .andWhere("inventario.createdAt >= DATE_TRUNC('month', NOW()) - INTERVAL '3 months'")
        .andWhere("inventario.createdAt < DATE_TRUNC('month', NOW())")
        .getRawMany();

        return [inventarioBajoStockRestockUltimosTresMeses, null];
    } catch (error) {
        console.error("Error al obtener productos con bajo stock y restock sugerido por los últimos 3 meses:", error);
        return [null, "Error interno del servidor"];
    }
}