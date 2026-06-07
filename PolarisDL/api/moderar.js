import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido');
    }

    const { action, id, token } = req.query;
    if (!token || token !== process.env.MOD_SECRET_TOKEN) {
        return res.status(403).send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #1a1a1a; color: #ff4d4d; height: 100vh; margin:0;">
                <h1>❌ Acceso Denegado</h1>
                <p>No tienes los permisos o el token de seguridad es inválido.</p>
            </div>
        `);
    }

    if (!id || !action) {
        return res.status(400).send('Faltan parámetros importantes (id o acción).');
    }

    try {
        let nuevoEstado = 'P';
        let mensajeVisual = '';
        let colorHtml = '#43b581'; 

        if (action === 'aceptar') {
            nuevoEstado = 'A'; // 'A' de Aprobado
            mensajeVisual = `✅ ¡El Récord #${id} ha sido APROBADO con éxito!`;
        } else if (action === 'rechazar') {
            nuevoEstado = 'R'; // 'R' de Rechazado
            mensajeVisual = `❌ El Récord #${id} ha sido RECHAZADO.`;
            colorHtml = '#f04747'; 
        } else {
            return res.status(400).send('Acción no reconocida.');
        }

        const { error } = await supabase
            .from('Sumbits') 
            .update({ Status: nuevoEstado })
            .eq('Id_Sumbit', id);

        if (error) throw error;

     
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
                    <p style="color: #888; font-size: 0.9rem;">Ya puedes cerrar esta pestaña y regresar a Discord.</p>
                </div>
            </body>
            </html>
        `);

    } catch (err) {
        console.error("Error en moderación:", err);
        return res.status(500).send(`Error interno al actualizar la base de datos: ${err.message}`);
    }
}