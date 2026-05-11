import React, { useRef, useEffect } from 'react';
import ScrollBall from './components/ScrollBall';
import Hero from './components/Hero';
import Countdown from './components/Countdown';
import ScrollVideo from './components/ScrollVideo';
import Gallery from './components/Gallery';
import Details from './components/Details';
import Magazine from './components/Magazine';
import TVSection from './components/TVSection';
import { ProgressBar, Footer } from './components/Footer';

function App() {
  return (
    <>
      <div className="page-grain"></div>
      <ProgressBar />
      <ScrollBall />
      
      <main>
        <Hero />
        <Countdown />
        <ScrollVideo />
        <Gallery />
        <Details />
        <Magazine />
        <TVSection />
      </main>

      <Footer />
    </>
  )
}

export default App
