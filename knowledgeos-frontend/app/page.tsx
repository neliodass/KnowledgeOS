'use client'; // Ważne, bo używamy useEffect

import { useEffect, useState } from 'react';

export default function Home() {
    const [message, setMessage] = useState('Ładowanie...');

    useEffect(() => {
        // Zakładam port 5000 zgodnie z Twoim launchSettings.json
        fetch('http://localhost:5000/api/Auth/register', {
            method: 'POST',
            headers: {
                // Tutaj normalnie wysyłałbyś token: 'Authorization': 'Bearer ...'
                'Content-Type': 'application/json',
            }
        })
            .then(res => {
                if (res.status === 401) return 'Połączono! (Ale brak dostępu - 401)';
                return res.json();
            })
            .then(data => setMessage(JSON.stringify(data)))
            .catch(err => setMessage('Błąd połączenia: ' + err.message));
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-4">KnowledgeOS Frontend</h1>
            <div className="p-4 border rounded shadow bg-gray-100 text-black">
                Status backendu: <strong>{message}</strong>
            </div>
        </main>
    );
}