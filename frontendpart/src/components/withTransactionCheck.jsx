import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkUserHasTransactions } from '../api';

// Higher-order component to check if user has transactions
const withTransactionCheck = (WrappedComponent) => {
  return (props) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [hasTransactions, setHasTransactions] = useState(true);
    
    useEffect(() => {
      const checkTransactions = async () => {
        try {
          const result = await checkUserHasTransactions();
          console.log('Transaction check result:', result);
          
          if (!result.success) {
            if (result.error) {
              console.warn('Transaction check error:', result.error);
            }
            // User has no transactions or there was an error, redirect to upload page
            navigate('/upload', { 
              state: { 
                message: result.error 
                  ? 'There was an error checking your transactions. Please try uploading a statement.' 
                  : 'Please upload your bank statement or transactions to continue.',
                severity: result.error ? 'warning' : 'info'
              } 
            });
            setHasTransactions(false);
          } else if (!result.hasTransactions) {
            // User has no transactions, redirect to upload page
            navigate('/upload', { 
              state: { 
                message: 'Please upload your bank statement or transactions to continue.',
                severity: 'info'
              } 
            });
            setHasTransactions(false);
          } else {
            setHasTransactions(true);
          }
        } catch (error) {
          console.error('Error checking transactions:', error);
          // On error, redirect to upload page
          navigate('/upload', { 
            state: { 
              message: 'There was an error checking your transactions. Please try uploading a statement.',
              severity: 'warning'
            } 
          });
          setHasTransactions(false);
        } finally {
          setLoading(false);
        }
      };
      
      checkTransactions();
    }, [navigate]);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!hasTransactions) {
      return null; // Will redirect in useEffect
    }
    
    return <WrappedComponent {...props} />;
  };
};

export default withTransactionCheck;