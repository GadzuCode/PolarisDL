import { createClient } from '@supabase/supabase-js';
import https from 'https'; // 👈 Importamos el módulo nativo e indestructible de Node.js

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    
    // ==========================================
    // 🔍 MÉTODO GET: Para mostrar récords en la web
    // ==========================================
    if (req.method === 'GET') {
        try {
            const { id_level } = req.query;

            if (!id_level) {
                return res.status(400).json({ error: 'Falta el parámetro Nivel' });
            }

            const { data, error } = await supabase
                .from('Sumbits') 
                .select(`
                    Id_Sumbit,
                    Link_Mostrar,
                    Nivel,
                    Player,
                    Jugador:Player ( Nombre )
                `)
                .eq('Nivel', id_level) 
                .eq('Status', 'A');

            if (error) {
                console.error("❌ Error en Supabase (GET):", error.message);
                return res.status(400).json({ error: error.message });
            }

            return res.status(200).json(data);
            
        } catch (err) {
            console.error("❌ Error en el servidor (GET):", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // ==========================================
    // 📥 MÉTODO POST: Para recibir nuevos formularios
    // ==========================================
    if (req.method === 'POST') {
        try {
            const { Nivel, Player, Link_Mostrar, Link_Raw, Status } = req.body;

            // 1. Insertar en la Base de Datos
            const { data, error: supabaseError } = await supabase
                .from('Sumbits') 
                .insert([
                    { 
                        Nivel: Nivel, 
                        Player: Player, 
                        Link_Mostrar: Link_Mostrar, 
                        Link_Raw: Link_Raw, 
                        Status: Status || 'P' 
                    }
                ])
                .select(); 

            if (supabaseError) {
                console.error("❌ Error en Supabase (POST):", supabaseError.message);
                return res.status(400).json({ error: supabaseError.message });
            }

            // ==========================================
            // 📢 ENVIAR AL WEBHOOK DE DISCORD (Método HTTPS Seguro)
            // ==========================================
            const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
            const modToken = process.env.MOD_SECRET_TOKEN;

            if (webhookUrl) {
                const idSumbitCreado = data && data[0] ? data[0].Id_Sumbit : 'Desconocido';

                const discordPayload = JSON.stringify({
                    username: "Polaris Récords Bot",
                    avatar_url: "https://polaris-dl.vercel.app/Recursos/Border.png",
                    embeds: [{
                        title: "Nueva petición ponganse a jalar",
                        color: 16711680, 
                        fields: [
                            { name: "ID Récord", value: `\`#${idSumbitCreado}\``, inline: true },
                            { name: "ID Nivel", value: `${Nivel}`, inline: true },
                            { name: "ID Jugador", value: `${Player}`, inline: true },
                            { name: "Link para Mostrar", value: Link_Mostrar },
                            { name: "Link Raw (Prueba)", value: Link_Raw },
                            { 
                                name: "⚡ ACCIONES DE MODERACIÓN", 
                                value: `🟩 [Aceptar Récord](https://polaris-dl.vercel.app/api/moderar?action=aceptar&id=${idSumbitCreado}&token=${modToken})\n\n🟥 [Rechazar Récord](https://polaris-dl.vercel.app/api/moderar?action=rechazar&id=${idSumbitCreado}&token=${modToken})`
                            }
                        ],
                        footer: { text: "Polaris Demon List - Haz clic en una acción para procesar" },
                        timestamp: new Date()
                    }]
                });

                // Enviamos a Discord usando la librería nativa para evitar caídas
                await new Promise((resolve) => {
                    const reqDiscord = https.request(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(discordPayload)
                        }
                    }, (resDiscord) => {
                        resDiscord.on('data', () => {});
                        resDiscord.on('end', () => resolve());
                    });

                    reqDiscord.on('error', (errDiscord) => {
                        console.error("❌ Error enviando a Discord:", errDiscord);
                        resolve(); // Resolvemos para no trabar la carga de Supabase
                    });

                    reqDiscord.write(discordPayload);
                    reqDiscord.end();
                });
            }

            // 3. Devolvemos el éxito al frontend
            return res.status(201).json(data);

        } catch (err) {
            console.error("❌ Error del servidor (POST):", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    return res.status(405).json({ error: 'Método no permitido' });
}