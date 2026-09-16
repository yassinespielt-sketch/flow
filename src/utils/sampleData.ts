import { ProposalInput, ColdDmInput } from '../types';

export const SAMPLE_PORTFOLIO = {
  service: 'Webflow & Framer Developer for Local Businesses',
  niche: 'Dental & Cosmetic Clinics in the US',
  text: `Hi, I am Alex Rivera. I am a freelance web designer and Webflow developer based in Austin, TX.
I create modern, clean, responsive websites.
I know HTML, CSS, JavaScript, React, Webflow, and Figma.
I love designing clean interfaces that look great on all devices.

My Recent Work:
- Project 1: A personal website redesign for a local coffee shop. Made with Webflow.
- Project 2: A landing page mockup for an imaginary skincare brand.
- Project 3: A dental clinic website redesign concept in Figma.

Contact me if you need a website built! I am flexible on rates and looking to build up my portfolio with great clients.`,
};

export const SAMPLE_PROPOSAL: ProposalInput = {
  clientName: 'Dr. Marcus Vance',
  clientCompany: 'Apex Smiles Dental & Orthodontics',
  jobDescription: `We need a high-converting website redesign for our 2 dental locations in Denver. Our current site is 7 years old, loads very slowly on mobile, and patient booking drop-off is over 65%. We need online appointment request integration, patient reviews showcased, and mobile speed under 2 seconds. Looking for someone who can manage this without endless back-and-forth.`,
  freelancerService: 'High-Converting Webflow Design & Local SEO',
  relevantExperience: `Designed 3 local healthcare clinics with integrated appointment booking, achieving 98+ Google mobile page speed and an average 38% bump in patient inquiries within 30 days.`,
  projectPrice: '$2,400',
  estimatedDeliveryTime: '12 business days',
  tone: 'Confident',
};

export const SAMPLE_COLD_DM: ColdDmInput = {
  businessName: 'Radiant Glow MedSpa',
  businessType: 'Medical Spa & Aesthetic Dermatology',
  websiteUrl: 'https://radiantglow-denver-example.com',
  instagramUrl: '@radiantglow_denver',
  freelancerService: 'Website Speed & Mobile Booking Optimization',
  problemNoticed: 'Mobile booking button on Instagram bio gets cut off on iPhone Safari and requires 6 clicks to confirm a consultation date.',
  personalizationDetails: 'Loved your recent Instagram reel demonstrating the HydraFacial results; the before-and-after video was super clear and engaging!',
};
