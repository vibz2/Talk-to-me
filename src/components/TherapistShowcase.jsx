import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { MessageCircle } from 'lucide-react';
import { motion } from "motion/react"

const therapists = [
    {
        name: 'Dr. Quentina Waddle',
        occupation: 'Cognitive Behavioral Therapy',
        quote: 'Let’s rethink, one step at a time.',
        url: 'https://prod.spline.design/vpGtZv00xY6QN-B6/scene.splinecode'
    },
    {
        name: 'Dr. Moana Burrow',
        occupation: 'Somatic Therapy',
        quote: 'Feel it in your roots.',
        url: 'https://prod.spline.design/KjYQ0LxW-pOBH3r5/scene.splinecode'
    },
    {
        name: 'Dr. Junibee Cottontuft',
        occupation: 'Reconstructive Therapy',
        quote: 'Soft steps. Strong rebuild.',
        url: 'https://prod.spline.design/3pZHwWqXg-pcbvsW/scene.splinecode'
    }
];

export default function TherapistShowcase() {
    const navigate = useNavigate();
    return (
        <section className="bg-[#FFFFFF] py-20 px-4">
            <motion.h2
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="text-center text-4xl font-bold text-[#2B2B2B] mb-14">
                Meet Our Therapists
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
                {therapists.map((therapist, index) => (
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true }}
                        key={index}
                        className="group bg-[#FFEBEB] p-6 rounded-3xl shadow-lg ring-1 ring-[#B80F2A]/30 flex flex-col items-center text-center hover:scale-[1.02] transition-all duration-300"
                    >
                        <div className="w-full h-[380px] sm:h-[440px] lg:h-[500px] rounded-2xl overflow-hidden bg-[#FFF5F5] mb-6">
                            <Spline scene={therapist.url} />
                        </div>

                        <h3 className="text-2xl font-bold text-[#2B2B2B]">{therapist.name}</h3>
                        <p className="text-md font-semibold text-[#B80F2A] mt-1">{therapist.occupation}</p>
                        <p className="text-sm text-[#2B2B2B]/80 mt-1 italic">{therapist.quote}</p>

                        <button 
                            onClick={() => navigate(`/chat/${therapist.mode}`)}
                            className="mt-6 bg-[#B80F2A] text-[#FFFFFF] font-medium px-5 py-2 rounded-xl hover:bg-[#E63946] hover:text-[#FFF8F8] flex items-center gap-2 transition cursor-pointer">
                            <MessageCircle className="w-4 h-4" />
                            Talk Now
                        </button>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
