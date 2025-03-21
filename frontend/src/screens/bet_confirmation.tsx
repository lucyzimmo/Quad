import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/navbar';

interface BetConfirmationState {
  marketTitle: string;
  betAmount: number;
  betChoice: 'yes' | 'no';
  potentialPayout: number;
  marketId: string;
}

export function BetConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as BetConfirmationState;

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Bet Confirmation</h1>
            <p className="text-gray-600 mb-6">No bet information found. Please try placing your bet again.</p>
            <Button onClick={() => navigate('/markets')} className="bg-cardinal-red text-white">
              Return to Markets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bet Placed Successfully!</h1>
            <p className="text-gray-600">Your bet has been confirmed and recorded</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bet Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Market</span>
                  <span className="font-medium text-gray-900">{state.marketTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Position</span>
                  <span className="font-medium text-gray-900">{state.betChoice.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium text-gray-900">{state.betAmount} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Potential Payout</span>
                  <span className="font-medium text-green-600">{state.potentialPayout} tokens</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => navigate(`/market/${state.marketId}`)}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 hover:border-cardinal-red"
              >
                Return to Market
              </Button>
              <Button 
                onClick={() => navigate('/markets')}
                className="flex-1 bg-cardinal-red text-white hover:bg-cardinal-red-hover"
              >
                Browse More Markets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 