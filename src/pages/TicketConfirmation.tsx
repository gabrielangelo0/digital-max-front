import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Home, Download, Share, Calendar, MapPin, Clock, User, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TicketData {
  id: string;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  roomName: string;
  sessionTime: string;
  sessionDate: string;
  seats: string[];
  totalAmount: number;
  paymentMethod: string;
  customerName: string;
  qrCode: string;
}

const TicketConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketData = location.state?.ticketData as TicketData;

  useEffect(() => {
    // Verificar se há dados do ticket
    if (!ticketData) {
      navigate('/');
      return;
    }

    // Animação de confetes
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Confetes do lado esquerdo
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      
      // Confetes do lado direito
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    return () => clearInterval(interval);
  }, [ticketData, navigate]);

  const handleDownloadTicket = () => {
    const ticketContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ingresso - ${ticketData.movieTitle}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              background: linear-gradient(135deg, #0f0f0f, #1a1a1a);
              color: white;
              padding: 40px 20px;
              min-height: 100vh;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
            }
            .ticket { 
              background: linear-gradient(145deg, #1e1e1e, #2a2a2a);
              border: 3px solid #e11d48;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 25px 50px rgba(225, 29, 72, 0.3);
              position: relative;
            }
            .ticket::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 6px;
              background: linear-gradient(90deg, #e11d48, #dc2626, #b91c1c);
            }
            .header { 
              text-align: center; 
              padding: 30px 20px 20px;
              background: linear-gradient(135deg, #1a1a1a, #111);
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #e11d48;
              margin-bottom: 10px;
              text-shadow: 0 0 20px rgba(225, 29, 72, 0.5);
            }
            .success-icon {
              background: #16a34a;
              width: 60px;
              height: 60px;
              border-radius: 50%;
              margin: 20px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              color: white;
            }
            .content {
              padding: 30px;
            }
            .movie-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #ffffff;
              text-align: center;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 30px 0;
            }
            .info-item {
              background: rgba(255,255,255,0.05);
              padding: 15px;
              border-radius: 10px;
              border-left: 4px solid #e11d48;
            }
            .info-label {
              font-size: 12px;
              color: #888;
              text-transform: uppercase;
              margin-bottom: 5px;
              font-weight: bold;
            }
            .info-value {
              font-size: 16px;
              color: #fff;
              font-weight: 600;
            }
            .seats {
              background: linear-gradient(135deg, #e11d48, #dc2626);
              color: white;
              padding: 20px;
              border-radius: 15px;
              text-align: center;
              margin: 30px 0;
            }
            .seats-title {
              font-size: 14px;
              opacity: 0.9;
              margin-bottom: 10px;
            }
            .seats-numbers {
              font-size: 24px;
              font-weight: bold;
            }
            .qr-section {
              text-align: center;
              padding: 30px 0;
              border-top: 2px dashed #444;
              margin-top: 30px;
            }
            .qr-code {
              width: 120px;
              height: 120px;
              background: white;
              margin: 0 auto 15px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: #333;
              font-weight: bold;
            }
            .total {
              background: linear-gradient(135deg, #facc15, #eab308);
              color: #000;
              padding: 20px;
              border-radius: 15px;
              text-align: center;
              margin: 20px 0;
              font-size: 24px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #333;
              margin-top: 30px;
            }
            @media print {
              body { background: white; color: black; }
              .ticket { border-color: #333; }
              .logo { color: #333; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="ticket">
              <div class="header">
                <div class="logo">🎬 DigitalMax</div>
                <div class="success-icon">✓</div>
                <h2 style="color: #16a34a; margin: 10px 0;">Compra Confirmada!</h2>
              </div>
              
              <div class="content">
                <div class="movie-title">${ticketData.movieTitle}</div>
                
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Cinema</div>
                    <div class="info-value">${ticketData.cinemaName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Sala</div>
                    <div class="info-value">${ticketData.roomName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Data</div>
                    <div class="info-value">${ticketData.sessionDate}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Horário</div>
                    <div class="info-value">${ticketData.sessionTime}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Cliente</div>
                    <div class="info-value">${ticketData.customerName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Pagamento</div>
                    <div class="info-value">${ticketData.paymentMethod}</div>
                  </div>
                </div>
                
                <div class="seats">
                  <div class="seats-title">ASSENTOS SELECIONADOS</div>
                  <div class="seats-numbers">${ticketData.seats.join(', ')}</div>
                </div>
                
                <div class="total">
                  TOTAL PAGO: R$ ${ticketData.totalAmount.toFixed(2)}
                </div>
                
                <div class="qr-section">
                  <div class="qr-code">${ticketData.qrCode}</div>
                  <p style="color: #888; font-size: 12px;">Código do Ingresso: ${ticketData.id}</p>
                  <p style="color: #888; font-size: 10px; margin-top: 10px;">
                    Apresente este código na entrada do cinema
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <p>© 2024 DigitalMax - Todos os direitos reservados</p>
                <p>Ingresso válido apenas para a sessão especificada</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([ticketContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ingresso-${ticketData.movieTitle.replace(/[^a-zA-Z0-9]/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!ticketData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header com animação */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            🎉 Parabéns!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-muted-foreground"
          >
            Sua compra foi realizada com sucesso! Aproveite o filme!
          </motion.p>
        </motion.div>

        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Card className="overflow-hidden border-2 border-primary shadow-2xl shadow-primary/20">
            {/* Header do Ticket */}
            <div className="bg-gradient-dark p-6 text-center border-b-2 border-dashed border-border">
              <div className="text-2xl font-bold text-primary mb-2">🎬 DigitalMax</div>
              <Badge className="bg-green-600 text-white px-4 py-1">
                Ingresso Confirmado
              </Badge>
            </div>

            <CardContent className="p-8">
              {/* Título do Filme */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {ticketData.movieTitle}
                </h2>
                <div className="flex justify-center">
                  <img
                    src={ticketData.moviePoster}
                    alt={ticketData.movieTitle}
                    className="w-32 h-48 object-cover rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* Informações do Ingresso */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cinema</p>
                      <p className="font-semibold text-foreground">{ticketData.cinemaName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-semibold text-foreground">{ticketData.sessionDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-semibold text-foreground">{ticketData.customerName}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="w-5 h-5 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs">
                      {ticketData.roomName.slice(-1)}
                    </Badge>
                    <div>
                      <p className="text-sm text-muted-foreground">Sala</p>
                      <p className="font-semibold text-foreground">{ticketData.roomName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Horário</p>
                      <p className="font-semibold text-foreground">{ticketData.sessionTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pagamento</p>
                      <p className="font-semibold text-foreground">{ticketData.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assentos */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2 text-center">Assentos Selecionados</p>
                <p className="text-2xl font-bold text-center text-primary">
                  {ticketData.seats.join(', ')}
                </p>
              </div>

              {/* Total */}
              <div className="bg-gradient-gold rounded-lg p-6 text-center mb-8">
                <p className="text-lg font-bold text-black">
                  Total Pago: R$ {ticketData.totalAmount.toFixed(2)}
                </p>
              </div>

              <Separator className="my-6" />

              {/* QR Code */}
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-muted">
                  <div className="text-center">
                    <div className="text-2xl mb-1">📱</div>
                    <div className="text-xs text-black font-bold">{ticketData.qrCode}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Código do Ingresso: {ticketData.id}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Apresente este código na entrada do cinema
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botões de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
        >
          <Button
            onClick={handleDownloadTicket}
            className="gradient-primary text-white"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar Ingresso
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/conta/compras')}
            size="lg"
          >
            <User className="w-5 h-5 mr-2" />
            Meus Ingressos
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Voltar ao Início
          </Button>
        </motion.div>

        {/* Mensagem de agradecimento */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-12 p-6 bg-muted/30 rounded-lg"
        >
          <p className="text-lg text-foreground mb-2">
            Obrigado por escolher o DigitalMax! 🍿
          </p>
          <p className="text-muted-foreground">
            Chegue com 15 minutos de antecedência. Tenha uma ótima sessão!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketConfirmation;