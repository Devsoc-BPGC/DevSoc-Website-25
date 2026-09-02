import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import InducteesSpotlight from '../components/InducteesSpotlight';
import FAQ from '../components/FAQ';

const Home = () => {
  return (
    <>
      <Hero />
      <InducteesSpotlight />
      <About />
      <FAQ />
    </>
  );
};

export default Home;