import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from './ui/Button';

interface VoiceInputProps {
  onResult: (text: string) => void;
  onError?: (error: string) => void;
}

export function VoiceInput({ onResult, onError }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check for speech recognition support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map(result => result.transcript)
            .join('');

          onResult(transcript);
        };

        recognition.onerror = (event: any) => {
          let message = '';
          switch (event.error) {
            case 'network':
              message = 'Error de red. Verifica tu conexión a internet.';
              break;
            case 'not-allowed':
              message = 'El acceso al micrófono está bloqueado. Verifica los permisos.';
              break;
            case 'no-speech':
              message = 'No se detectó ninguna voz. Por favor, intenta de nuevo.';
              break;
            default:
              message = `Error: ${event.error}`;
          }
          
          setErrorMessage(message);
          if (onError) onError(message);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    } catch (error) {
      setErrorMessage('El reconocimiento de voz no está soportado en este navegador');
      if (onError) onError('El reconocimiento de voz no está soportado en este navegador');
    }

    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onResult, onError]);

  const toggleListening = () => {
    if (!recognition) {
      setErrorMessage('El reconocimiento de voz no está soportado en este navegador');
      if (onError) onError('El reconocimiento de voz no está soportado en este navegador');
      return;
    }

    try {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        setErrorMessage(null);
        recognition.start();
        setIsListening(true);
      }
    } catch (error) {
      setErrorMessage('Error al iniciar el reconocimiento de voz');
      if (onError) onError('Error al iniciar el reconocimiento de voz');
      setIsListening(false);
    }
  };

  if (!recognition) {
    return (
      <div>
        <Button variant="secondary" disabled>
          <MicOff className="h-4 w-4 mr-2" />
          No disponible
        </Button>
        {errorMessage && (
          <p className="text-sm text-pink-500 mt-2">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <Button
        variant={isListening ? 'primary' : 'secondary'}
        onClick={toggleListening}
      >
        {isListening ? (
          <>
            <Mic className="h-4 w-4 mr-2 animate-pulse" />
            Escuchando...
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            Usar Voz
          </>
        )}
      </Button>
      {errorMessage && (
        <p className="text-sm text-pink-500 mt-2">{errorMessage}</p>
      )}
    </div>
  );
}
