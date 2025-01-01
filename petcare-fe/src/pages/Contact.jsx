import React from 'react';
import { ContactInfo } from "../components/contact/ContactInfo.jsx";
import { ContactForm } from "../components/contact/ContactForm.jsx";

function Contact() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-8 grid md:grid-cols-2 gap-8">
                <ContactInfo />
                <ContactForm />
            </div>
        </div>
    );
}

export default Contact;