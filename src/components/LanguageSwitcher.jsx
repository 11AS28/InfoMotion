import React, { useState, useEffect, useRef } from 'react';



const LANGUAGES = [
    { code: 'ro', label: 'RO', flag: '🇷🇴', name: 'Română' },
    { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
    { code: 'hu', label: 'HU', flag: '🇭🇺', name: 'Magyar' }
];
export default function LanguageSelect() {
    const [activeLang, setActiveLang] = useState('ro');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const getLanguageFromCookie = () => {
        const match = document.cookie.match(/googtrans=\/ro\/([^;]+)/);
        if (match && match[1]) {
            return match[1];
        }
        return 'ro';
    };
    useEffect(() => {
        setActiveLang(getLanguageFromCookie());
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    useEffect(() => {
        const enforceNoBanner = () => {
            document.body.style.top = '0px';
            document.body.style.position = 'static';
            const html = document.documentElement;
            if (html) {
                html.style.top = '0px';
            }
            const classesToHide = ['goog-te-banner-frame', 'goog-te-banner'];
            classesToHide.forEach(className => {
                const elements = document.getElementsByClassName(className);
                for (let i = 0; i < elements.length; i++) {
                    elements[i].style.setProperty('display', 'none', 'important');
                    elements[i].style.setProperty('visibility', 'hidden', 'important');
                }
            });
            const iframes = document.getElementsByTagName('iframe');
            for (let i = 0; i < iframes.length; i++) {
                if (iframes[i].classList.contains('skiptranslate') || iframes[i].className.includes('goog-te')) {
                    iframes[i].style.setProperty('display', 'none', 'important');
                    iframes[i].style.setProperty('visibility', 'hidden', 'important');
                }
            }
        };
        enforceNoBanner();
        const observer = new MutationObserver(() => {
            enforceNoBanner();
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            childList: true,
            subtree: true
        });
        const htmlObserver = new MutationObserver(() => {
            const html = document.documentElement;
            if (html && html.style.top !== '0px') {
                html.style.top = '0px';
            }
        });
        htmlObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });
        const interval = setInterval(enforceNoBanner, 300);
        return () => {
            observer.disconnect();
            htmlObserver.disconnect();
            clearInterval(interval);
        };
    }, []);
    useEffect(() => {
        let translateDiv = document.getElementById('google_translate_element');
        if (!translateDiv) {
            translateDiv = document.createElement('div');
            translateDiv.id = 'google_translate_element';
            translateDiv.style.display = 'none';
            document.body.appendChild(translateDiv);
        }
        // 2. Define the global callback for google translate
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement({
                pageLanguage: 'ro',
                includedLanguages: 'ro,en,hu',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google_translate_element');
        };
        // 3. Load the Google Translate script if not loaded
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.type = 'text/javascript';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.body.appendChild(script);
        }
    }, []);
    const changeLanguage = (langCode) => {
        // Set cookie for both domain configurations to ensure Google Translate picks it up
        const domain = window.location.hostname;
        document.cookie = `googtrans=/ro/${langCode}; path=/;`;
        document.cookie = `googtrans=/ro/${langCode}; path=/; domain=${domain}`;
        if (domain.includes('.')) {
            document.cookie = `googtrans=/ro/${langCode}; path=/; domain=.${domain}`;
        }
        setActiveLang(langCode);
        setIsOpen(false);
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event('change'));
        } else {
            // Fallback: reload the page to apply cookie
            window.location.reload();
        }
    };
    const currentLangObj = LANGUAGES.find(l => l.code === activeLang) || LANGUAGES[0];
    return (
        <div className="lang-select-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                    }
                }}
            >
                <span>{currentLangObj.flag}</span>
                <span>{currentLangObj.label}</span>
                <span style={{ fontSize: '10px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>▼</span>
            </button>
            {isOpen && (
                <ul
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 5px)',
                        right: 0,
                        zIndex: 99999,
                        minWidth: '120px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '6px 0',
                        listStyle: 'none',
                        margin: 0,
                        boxShadow: 'var(--shadow-lg)',
                        animation: 'fadeInUp 0.15s ease-out'
                    }}
                >
                    {LANGUAGES.map((lang) => (
                        <li key={lang.code}>
                            <button
                                type="button"
                                onClick={() => changeLanguage(lang.code)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 16px',
                                    border: 'none',
                                    backgroundColor: activeLang === lang.code ? 'var(--accent-bg)' : 'transparent',
                                    color: activeLang === lang.code ? 'var(--accent)' : 'var(--text-primary)',
                                    fontSize: '13px',
                                    fontWeight: activeLang === lang.code ? '700' : '500',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    width: '100%',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeLang !== lang.code) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeLang !== lang.code) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
