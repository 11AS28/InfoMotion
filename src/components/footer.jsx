import '../components_css/footer.css';
import { FaGithub, FaInstagram } from "react-icons/fa"; 
import { IoLogoVercel } from "react-icons/io5";
import { CgMail } from "react-icons/cg";

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                
               
                <div className="footer-top">
                    
                    <div className="footer-brand">
                        <h3>InfoMotion<span>.</span></h3>
                        <p>Descoperă logica din spatele codului.</p>
                        
                    </div>

                    <div className="social-links">
                        
                        <a href="https://github.com/11AS28/InfoMotion" target="_blank" rel="noreferrer" aria-label="GitHub">
                            <FaGithub />
                        </a>  
                        <a href="mailto:infomotion2026@gmail.com" target="_blank" rel="noreferrer" aria-label="Vercel">
                            <CgMail />
                        </a>
                        <a href="https://www.instagram.com/info.motion2026/?hl=en" target="_blank" rel="noreferrer" aria-label="Instagram">
                            <FaInstagram />
                        </a>

                    </div>
                    
                </div>

                
                <div className="footer-bottom">
                <p className="text-bottom">infomotion2026@gmail.com</p>

                <div className="footer-legal-links">
                    <a href="/confidentialitate" className="text-bottom">Politica de confidențialitate</a>
                    <span className="footer-separator">•</span>
                    <a href="/termeni" className="text-bottom">Termeni și condiții</a>
                </div>

                <p className="text-bottom">
                    &copy; {new Date().getFullYear()} InfoMotion. Toate drepturile rezervate.
                </p>
                </div>
                
            </div>
        </footer>
    );
}

export default Footer;
