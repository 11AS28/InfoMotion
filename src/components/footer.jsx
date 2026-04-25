import '../components_css/footer.css';
import { FaGithub } from "react-icons/fa"; 
import { IoLogoVercel } from "react-icons/io5";

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                
                {/* Partea de Sus a Footer-ului (Brand + Social) */}
                <div className="footer-top">
                    
                    <div className="footer-brand">
                        <h3>InfoMotion<span>.</span></h3>
                        <p>Descoperă logica din spatele codului.</p>
                    </div>

                    <div className="social-links">
                        {/* Pune linkurile tale reale aici */}
                        <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
                            <FaGithub />
                        </a>  
                        <a href="https://vercel.com" target="_blank" rel="noreferrer" aria-label="Vercel">
                            <IoLogoVercel />
                        </a>
                    </div>
                    
                </div>

                {/* Partea de Jos (Copyright) */}
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} InfoMotion. Toate drepturile rezervate.</p>
                </div>
                
            </div>
        </footer>
    );
}

export default Footer;