import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Linkedin } from 'lucide-react';

// coordis
import utkarsh from '../assets/cocos_26_27/utkarsh.png';
import satvikjain from '../assets/cocos_26_27/satvikjain.png';
import umang from '../assets/cocos_26_27/umang.png';
import satviksrinivas from '../assets/cocos_26_27/satviksrinivas.png';
import tanay from '../assets/cocos_26_27/tanay.png';
import anvesh from '../assets/cocos_26_27/anvesh.png';
import rishika from '../assets/cocos_26_27/rishika.png';


const Coordinators=() => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.fromTo(
      '.coordinator-item',
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const coordinators = [
    {
      name: 'Utkarsh Sharma',
      role: 'Chief Coordinator',
      image: utkarsh,
      linkedin: 'https://in.linkedin.com/in/utkarsh-sharma-37090a27a',
    },
    {
      name: 'Satvik Jain',
      role: 'Sub-Coordinator',
      image: satvikjain,
      linkedin: 'https://www.linkedin.com/in/satvik-jain-64a30631a/',
    },
    {
      name: 'Umang Goel',
      role: 'AI-ML Head',
      image: umang,
      linkedin: 'https://www.linkedin.com/in/umang-goel-7a0b52311/',
    },
    {
      name: 'Satvik Srinivas',
      role: 'App Development Head',
      image: satviksrinivas,
      linkedin: 'https://www.linkedin.com/in/satvik-srinivas-b94165247/',
    },
    {
      name: 'Tanay Sheth',
      role: 'Web Development Head',
      image: tanay,
      linkedin: 'https://www.linkedin.com/in/tanay-sheth-088123344/',
    },
    {
      name: 'Anvesh Mishra',
      role: 'Game Development Head',
      image: anvesh,
      linkedin: 'https://mrgreenapplz.netlify.app',
    },
    {
      name: 'Rishika Gupta',
      role: 'UI/UX Head',
      image: rishika,
      linkedin: 'https://www.linkedin.com/in/rishika-gupta-05858b2b5/',
    }
  ];

  return (
    <section id="coordinators" ref={sectionRef} className="py-24 px-6  bg-slate-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="coordinator-item">
            <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight text-gray-900 dark:text-white">
              Meet Our <span className="font-bold text-teal-600">Team</span>
            </h2>
          </div>
          <div className="coordinator-item">
            <div className="w-16 h-px bg-teal-600 mx-auto mb-8" />
          </div>
          <div className="coordinator-item">
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our dedicated coordinators bring diverse expertise and passion to drive 
              DEVSOC's mission forward. Get to know the leaders behind our community.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {coordinators.map((coordinator, index) => (
            <div
              key={index}
              className="coordinator-item w-full sm:w-[45%] md:w-[30%] lg:w-[22%] 
                 bg-white dark:bg-gray-800 rounded-lg p-6 text-center 
                 hover:shadow-lg dark:hover:shadow-2xl transition-shadow 
                 duration-300 group border border-gray-100 dark:border-gray-700"
            >
              <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full">
                <img
                  src={coordinator.image}
                  alt={coordinator.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {coordinator.name}
              </h3>

              <p className="text-sm font-medium text-teal-600 mb-1">
                {coordinator.role}
              </p>

              <div className="flex justify-center space-x-3">
                <a
                  href={coordinator.linkedin}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-teal-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Coordinators;