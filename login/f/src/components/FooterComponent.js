import React from 'react'
import { Link } from 'react-router-dom'
import './FooterComponent.css'

const FooterComponent = () => {
    const quickLinks = [
        { path: '/', label: 'Dashboard' },
        { path: '/courses', label: 'Courses' },
        { path: '/lessons', label: 'Lessons' },
        { path: '/quizzes', label: 'Quizzes' },
        { path: '/users', label: 'Users' },
        { path: '/enrollments', label: 'Enrollments' }
    ]

    // Resources removed per request

    const socialLinks = [
        { icon: 'fab fa-facebook-f', label: 'Facebook', href: '#' },
        { icon: 'fab fa-twitter', label: 'Twitter', href: '#' },
        { icon: 'fab fa-linkedin-in', label: 'LinkedIn', href: '#' },
        { icon: 'fab fa-github', label: 'GitHub', href: '#' },
        { icon: 'fab fa-youtube', label: 'YouTube', href: '#' }
    ]

    return (
        <footer className="footer-modern bg-light text-dark mt-5 position-relative overflow-hidden border-top">
            <div className="footer-top-accent"></div>
            <div className="footer-wave" aria-hidden="true"></div>
            <div className="container py-5">
                <div className="row g-4 align-items-start">
                    <div className="col-lg-4 mb-4">
                        <div className="d-flex align-items-center mb-3">
                            <span className="me-3" style={{ fontSize: '2.5rem', color: '#6c757d' }}>🎓</span>
                            <div>
                                <h5 className="mb-1 text-primary">CodeMingle</h5>
                                <small className="text-muted">Learn • Code • Grow</small>
                            </div>
                        </div>
                        <p className="mb-3 text-muted lh-base">
                            Empowering learners with comprehensive coding education and interactive learning experiences through modern technology and innovative teaching methods.
                        </p>
                        <div className="d-flex gap-2">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center footer-social"
                                    style={{ width: '40px', height: '40px' }}
                                    aria-label={social.label}
                                >
                                    <i className={social.icon}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-4 mb-4">
                        <h6 className="mb-3 fw-bold text-dark">Quick Links</h6>
                        <div className="row">
                            <div className="col-6">
                                <ul className="list-unstyled">
                                    {quickLinks.slice(0, 3).map((link, index) => (
                                        <li key={index} className="mb-2">
                                            <Link
                                                to={link.path}
                                                className="text-muted text-decoration-none footer-link d-block"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="col-6">
                                <ul className="list-unstyled">
                                    {quickLinks.slice(3).map((link, index) => (
                                        <li key={index} className="mb-2">
                                            <Link
                                                to={link.path}
                                                className="text-muted text-decoration-none footer-link d-block"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4 mb-4">
                        <h6 className="mb-3 fw-bold text-dark">Contact</h6>
                        <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-envelope me-3 text-primary"></i>
                            <span className="text-muted">support@codemingle.com</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-phone me-3 text-primary"></i>
                            <span className="text-muted">+94 71 7244872</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-clock me-3 text-primary"></i>
                            <span className="text-muted">{new Date().toLocaleString()}</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <i className="fas fa-map-marker-alt me-3 text-primary"></i>
                            <span className="text-muted">Colombo 03, Sri Lanka</span>
                        </div>
                    </div>
                </div>

                <hr className="my-4" />

                <div className="row align-items-center">
                    <div className="col-md-6 mb-3 mb-md-0">
                        <small className="text-muted">
                            © {new Date().getFullYear()} CodeMingle. All Rights Reserved.
                        </small>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <small className="text-muted">
                            Made with <i className="fas fa-heart text-danger mx-1"></i> for coding education
                        </small>
                        <a href="#top" className="btn btn-link p-0 ms-3 back-to-top" aria-label="Back to top">
                            <i className="fas fa-arrow-up me-1"></i>Top
                        </a>
                    </div>
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="position-absolute top-0 end-0 opacity-5" style={{ fontSize: '8rem', color: '#6c757d' }}>
                <i className="fas fa-code"></i>
            </div>
            <div className="position-absolute bottom-0 start-0 opacity-5" style={{ fontSize: '6rem', color: '#6c757d' }}>
                <i className="fas fa-laptop-code"></i>
            </div>
        </footer>
    )
}

export default FooterComponent
