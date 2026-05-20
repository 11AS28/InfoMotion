import { useState } from "react";
import Nav from "../components/nav";
import Footer from "../components/footer";
import '../pages_css/contact.css';
import { FaDiscord, FaGithub, FaInstagram, FaChevronDown } from "react-icons/fa";
import { CgMail } from "react-icons/cg";
import { db } from "../firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const FAQ_ITEMS = [
    {
        question: "Platforma este gratuită?",
        answer: "Da, Info-Motion este 100% gratuită. Tot ce ai nevoie este un cont creat cu emailul tău sau cu Google."
    },
    {
        question: "Trebuie să am cont pentru a accesa lecțiile?",
        answer: "Poți naviga prin paginile publice fără cont, însă pentru a accesa lecțiile, a rezolva quiz-uri și a acumula puncte este necesară autentificarea."
    },
    {
        question: "Ce nivel de cunoștințe am nevoie pentru a folosi platforma?",
        answer: "Platforma este destinată elevilor claselor IX-XII, indiferent de nivel. Lecțiile sunt organizate pe clase și pornesc de la noțiuni de bază, deci poți începe oricând."
    },
    {
        question: "Cum funcționează sistemul de puncte?",
        answer: "Primești 10 puncte pentru fiecare lecție finalizată (quiz rezolvat corect). La Problema Zilei poți câștiga 10, 30 sau 50 de puncte în funcție de dificultate, plus bonusuri dacă ești printre primii care trimit soluția corectă."
    },
    {
        question: "Ce este Problema Zilei?",
        answer: "În secțiunea Arena găsești zilnic 3 probleme de algoritmică de dificultăți diferite (ușoară, medie, grea), rezolvate pe Codeforces. Poți câștiga puncte suplimentare față de lecțiile obișnuite."
    },
    {
        question: "Pot propune o problemă sau o lecție?",
        answer: "Această funcționalitate este în curs de dezvoltare! În curând elevii vor putea propune probleme inspirate din Codeforces sau PbInfo, însoțite de un mesaj scurt pentru colegi."
    },
];

function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`faq-item ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
            <div className="faq-question">
                <span>{question}</span>
                <FaChevronDown className="faq-icon" />
            </div>
            {open && <p className="faq-answer">{answer}</p>}
        </div>
    );
}

function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;

        setStatus("loading");
        try {
            await addDoc(collection(db, "contact_messages"), {
                ...form,
                createdAt: serverTimestamp(),
            });
            setStatus("success");
            setForm({ name: "", email: "", message: "" });
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    };

    return (
        <div className="page-wrapper">
            <main className="contact-container">

                {/* Header */}
                <div className="contact-header">
                    <h1>Contactează-ne<span>.</span></h1>
                    <h2>Hai să discutăm!</h2>
                </div>

                {/* Linkuri sociale */}
                <section className="contact-section">
                    <p className="contact-description">
                        Dacă ai întrebări, sugestii sau vrei să ne spui ceva, nu ezita să ne contactezi.
                        Suntem aici să te ajutăm și să îmbunătățim InfoMotion împreună!
                    </p>
                    <ul className="contact-links">
                        <li>
                            <a href="mailto:infomotion2026@gmail.com" className="social-card gmail">
                                <CgMail className="icon" />
                                <span>infomotion2026@gmail.com</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.instagram.com/info.motion2026/?hl=en" target="_blank" rel="noopener noreferrer" className="social-card instagram">
                                <FaInstagram className="icon" />
                                <span>@info.motion2026</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/11AS28" target="_blank" rel="noopener noreferrer" className="social-card github">
                                <FaGithub className="icon" />
                                <span>@11AS28</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/antidate723" target="_blank" rel="noopener noreferrer" className="social-card github">
                                <FaGithub className="icon" />
                                <span>@antidate723</span>
                            </a>
                        </li>
                    </ul>
                </section>
                {/* FAQ */}
                <section className="faq-section">
                    <h2 className="section-title">❓ Întrebări frecvente</h2>
                    <div className="faq-list">
                        {FAQ_ITEMS.map((item, index) => (
                            <FaqItem key={index} question={item.question} answer={item.answer} />
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}

export default Contact;
