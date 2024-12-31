import React, { useEffect } from 'react';

const ParticlesBackground = () => {
  useEffect(() => {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        size: {
          value: 3,
        },
        move: {
          speed: 3,
        },
      },
    });
  }, []);

  return (
    <div id="particles-js" className="particles-container">
      <div className="content">
      </div>
    </div>
  );
};

export default ParticlesBackground;
