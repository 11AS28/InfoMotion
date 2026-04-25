import Nav from "../components/nav";
import Footer from "../components/footer";
import '../pages_css/contact.css';
import { FaDiscord, FaGithub } from "react-icons/fa";

function Contact() {
    return (
        <div className="page-wrapper">
            <Nav />

            {/* Containerul principal al paginii */}
            <main className="contact-container">
                
                {/* Zona de titluri */}
                <div className="contact-header">
                    <h1>Contactează-ne<span>.</span></h1>
                    <h2>Hai să discutăm!</h2>
                </div>

                {/* Zona de conținut (Paragraf + Linkuri) */}
                <section className="contact-section">
                    <p className="contact-description">
                        Dacă ai întrebări, sugestii sau vrei să ne spui ceva, nu ezita să ne contactezi. Suntem aici să te ajutăm și să îmbunătățim InfoMotion împreună!
                    </p>
                    
                    {/* Așa se face corect o listă de linkuri sociale */}
                    <ul className="contact-links">
                        <li>
                            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="social-card discord">
                                <FaDiscord className="icon" /> 
                                <span>@fanec0x</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/11AS28" target="_blank" rel="noopener noreferrer" className="social-card github">
                                <FaGithub className="icon" /> 
                                <span>@11AS28</span>
                            </a>
                        </li>
                    </ul>
                </section>

            </main>

            <Footer />
        </div>
    );
}

export default Contact;