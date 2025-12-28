import React from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component{
    constructor(props){
        super(props);
        this.state={
            hasError:false,
            error:null,
            errorInfo:null
        };
    }
    static getDerivedStateFromError(error){
        return{hasError:true};
    }
    componentDidCatch(error,errorInfo){
        console.log("Error Caught by boundary:",error,errorInfo);
        this.setState({
            error:error,
            errorInfo:errorInfo
        });
    }
    handleRetry= ()=>{
        this.setState({
            hasError:false,
            error:null,
            errorInfo:null
        });
    };
    render(){
        if (this.state.hasError){
            return(
                <div className="error-boundary">
                    <div className="error-content">
                        <h2>Oops! Something went Wrong</h2>
                        <p>We encountered an unexpected error. Don't Worry , our team has been notified. </p>
                        {this.state.errorInfo && (
                        <details className="error-details">
                            <summary>
                                Technical Details (for developers)
                            </summary>
                            <p>{this.state.error ? this.state.error.toString():"unknown Error"}</p>
                            <pre>{this.state.errorInfo.componentStack || "No stack Trace available"}</pre>
                        </details>
                    )}
                        <div className="error-actions">
                            <button className="btn btn-warning" onClick={this.handleRetry}> Try Again</button>
                            <button className="btn btn-outline-light" onClick={()=>window.location.href="/"}>Go Home</button>
                           
                        </div>
                    </div>
                </div>
            );

        }
        return this.props.children;
    }
}
export default ErrorBoundary;