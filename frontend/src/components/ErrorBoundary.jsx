import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
             return (
                 <div className="min-h-[400px] flex items-center justify-center p-6">
                     <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-lg text-center">
                         <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                             <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                             </svg>
                         </div>
                         <h2 className="text-xl font-black text-slate-900 mb-2">Something went wrong</h2>
                         <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                             An unexpected issue occurred while rendering this component. Please try reloading the page.
                         </p>
                         <button
                             onClick={this.handleReset}
                             className="w-full bg-brand-DEFAULT hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 text-sm"
                         >
                             Reload Page
                         </button>
                     </div>
                 </div>
             );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;

