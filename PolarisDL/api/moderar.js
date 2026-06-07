import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido');
    }

    const { action, id, token } = req.query;

    // 1. Validar Token de Seguridad
    if (!token || token !== process.env.MOD_SECRET_TOKEN) {
        return res.status(403).send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #1a1a1a; color: #ff4d4d; height: 100vh; margin:0;">
                <h1>❌ Acceso Denegado</h1>
                <p>El token de seguridad es inválido o expiró.</p>
            </div>
        `);
    }

    if (!id || !action) {
        return res.status(400).send('Faltan parámetros (id o action).');
    }

    try {
        let nuevoEstado = 'P';
        let mensajeVisual = '';
        let colorHtml = '#43b581'; 

        if (action === 'aceptar') {
            nuevoEstado = 'A';
            mensajeVisual = `✅ ¡El Récord #${id} ha sido APROBADO con éxito!`;
        } else if (action === 'rechazar') {
            nuevoEstado = 'R';
            mensajeVisual = `❌ El Récord #${id} ha sido RECHAZADO.`;
            colorHtml = '#f04747'; 
        }

        // --- INTENTO 1: Buscar con el nombre exacto e ID como número ---
        let resultado = await supabase
            .from('Sumbits')
            .update({ Status: nuevoEstado })
            .eq('Id_Sumbit', parseInt(id, 10))
            .select();

        // --- INTENTO 2: Si el intento 1 no hizo nada, probamos con minúsculas ---
        if (!resultado.data || resultado.data.length === 0) {
            resultado = await supabase
                .from('Sumbits')
                .update({ Status: nuevoEstado })
                .eq('id_sumbit', parseInt(id, 10))
                .select();
        }

        // --- INTENTO 3: Por si las dudas, probamos pasando el ID como texto plano ---
        if (!resultado.data || resultado.data.length === 0) {
            resultado = await supabase
                .from('Sumbits')
                .update({ Status: nuevoEstado })
                .eq('Id_Sumbit', String(id))
                .select();
        }

        // 🚨 SI DE PLANO NINGUNO CORRIÓ, VAMOS A BUSCAR EL ERROR OCULTO
        if (!resultado.data || resultado.data.length === 0) {
            
            // Hacemos una consulta rápida solo para ver si el registro existe de verdad
            const { data: registroExiste } = await supabase
                .from('Sumbits')
                .select('*')
                .or(`Id_Sumbit.eq.${id},id_sumbit.eq.${id}`);

            const existeTexto = (registroExiste && registroExiste.length > 0) 
                ? '🟢 El récord SÍ existe en la DB, pero el UPDATE fue ignorado (posiblemente por políticas RLS activadas).' 
                : '🔴 El récord NO se encuentra en la DB con ese ID usando ningún método de búsqueda.';

            return res.status(404).send(`
                <div style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #1a1a1a; color: #ffaa00; height: 100vh; margin:0;">
                    <h1>⚠️ Diagnóstico de Base de Datos</h1>
                    <p>Ninguna de las 3 estrategias de actualización modificó filas.</p>
                    <div style="background-color: #2b2b2b; padding: 15px; border-radius: 8px; color: #fff; display: inline-block; text-align: left; margin: 20px 0;">
                        <b>🔍 Estado del Récord #${id}:</b><br>${existeTexto}<br><br>
                        <b>Detalle técnico de Supabase:</b> ${resultado.error ? resultado.error.message : 'Ninguno (0 filas afectadas)'}
                    </div>
                    <p>Si el récord sí existe, ve a Supabase y desactiva las <b>RLS Policies</b> para la tabla <i>Sumbits</i>.</p>
                </div>
            `);
        }

        // 3. Pantalla de éxito real
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Panel de Moderación Polaris</title>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #ffffff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
                <div style="background-color: #1e1e1e; padding: 40px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); text-align: center; border-top: 8px solid ${colorHtml}; max-width: 400px;">
                    <h1 style="color: ${colorHtml}; margin-bottom: 20px;">Polaris Demon List</h1>
                    <p style="font-size: 1.2rem; line-height: 1.6; margin-bottom: 30px;">${mensajeVisual}</p>
                    <p style="color: #555; font-size: 0.85rem; margin-bottom: 10px;">Modificación confirmada en Supabase.</p>
                </div>
            </body>
            </html>
        `);

    } catch (err) {
        return res.status(500).send(`Error interno: ${err.message}`);
    }
}