window.S_URL='https://zvtzbiqfwhggysiuiuxh.supabase.co'

window.S_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2dHpiaXFmd2hnZ3lzaXVpdXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODYyMjcsImV4cCI6MjA5MzE2MjIyN30.tCnFZv2B6Kmd9KsyZM8CHClZqsq7Nyu-8nxyYVs_ZMQ'

window.clientPublic = supabase.createClient(
    window.S_URL,
    window.S_KEY,
    {
        db:{ schema:'public' },
        global:{
            headers:{
                "Accept-Profile":"public",
                "Content-Profile":"public"
            }
        }
    }
)

window.clientQueimadas = supabase.createClient(
    window.S_URL,
    window.S_KEY,
    {
        db:{ schema:'queimadas' },
        global:{
            headers:{
                "Accept-Profile":"queimadas",
                "Content-Profile":"queimadas"
            }
        }
    }
)


console.log('SUPABASE OK')
console.log(window.client)
