import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { MessageCircle } from 'lucide-react';

const therapists = [
    { name: 'Dr. Sam', occupation: 'Cognitive Behavioral Therapy', quote: 'Let’s rethink together.', mode: 'cbt' },
    { name: 'Dr. Ava', occupation: 'Somatic Therapy', quote: 'Feel and heal gently.', mode: 'somatic' },
    { name: 'Dr. Leo', occupation: 'Psychodynamic Therapy', quote: 'Explore the past, understand the present.', mode: 'psychodynamic' },
];

export default function TherapistShowcase() {
    const navigate = useNavigate();
    return (
        <section className="bg-[#FFFFFF] py-20 px-4">
            <h2 className="text-center text-4xl font-bold text-[#2B2B2B] mb-14">
                Meet Our Therapists
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
                {therapists.map((therapist, index) => (
                    <div
                        key={index}
                        className="group bg-[#FFEBEB] p-6 rounded-3xl shadow-lg ring-1 ring-[#B80F2A]/30 flex flex-col items-center text-center hover:scale-[1.02] transition-all duration-300"
                    >
                        <div className="w-full h-[380px] sm:h-[440px] lg:h-[500px] rounded-2xl overflow-hidden bg-[#FFF5F5] mb-6">
                            <Spline scene='https://prod.spline.design/KjYQ0LxW-pOBH3r5/scene.splinecode' />
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
                    </div>
                ))}
            </div>
        </section>
    );
}
