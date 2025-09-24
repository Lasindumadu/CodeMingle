<div className="demo-login-section">
                    <div className="demo-login-divider">
                      <span>or</span>
                    </div>
                    <div className="demo-login-buttons">
                      <button 
                        type="button" 
                        className="btn btn-demo btn-demo-admin" 
                        onClick={() => handleDemoLogin('admin')}
                        disabled={loading}
                      >
                        <i className="fas fa-user-shield me-2"></i>
                        Demo Admin Login
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-demo btn-demo-user" 
                        onClick={() => handleDemoLogin('user')}
                        disabled={loading}
                      >
                        <i className="fas fa-user me-2"></i>
                        Demo User Login
                      </button>
                    </div>
                    <div className="demo-login-info">
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Demo accounts will be automatically created if they don't exist
                      </small>
                    </div>
                  </div>
