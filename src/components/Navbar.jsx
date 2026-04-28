import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Network } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ isAIOpen, setIsAIOpen }) => {
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true); // scrolling down & passed header
    } else {
      setHidden(false); // scrolling up
    }
    
    setIsScrolled(latest > 20);
  });

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-md border-b border-slate-200' : 'bg-white/50 backdrop-blur-sm border-transparent'
      }`}
    >
      {/* Three-column layout: Logo | Centered Nav | AI Button */}
      <div style={{
        position: 'relative',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        height: isScrolled ? '4rem' : '5rem',
        transition: 'height 0.3s ease'
      }}>

        {/* Logo — left */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0, opacity: 1, transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <img src="/ai-logo.png" alt="AI Logo" style={{ width: '40px', height: '40px', borderRadius: '0.75rem', objectFit: 'cover' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a' }}>NETCORE</span>
        </Link>

        {/* Nav Links — absolutely centered */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          whiteSpace: 'nowrap'
        }}>
          {[
            { label: '首页', to: '/', isLink: true },
            { label: '教学团队', to: '/#courses', isLink: false },
            { label: '学习资源', to: '/#resources', isLink: false },
            { label: '仿真工具', to: '/tools', isLink: true },
          ].map(item => item.isLink ? (
            <Link key={item.label} to={item.to} style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
              onMouseLeave={e => e.currentTarget.style.color = '#1e293b'}
            >{item.label}</Link>
          ) : (
            <a key={item.label} href={item.to} style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
              onMouseLeave={e => e.currentTarget.style.color = '#1e293b'}
            >{item.label}</a>
          ))}
          <Link to="/knowledge-graph" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
            onMouseLeave={e => e.currentTarget.style.color = '#1e293b'}
          >
            <span style={{ color: '#4f46e5', fontWeight: 900 }}>AI+</span>知识图谱
          </Link>
          <Link to="/dashboard" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
            onMouseLeave={e => e.currentTarget.style.color = '#1e293b'}
          >学业诊断</Link>
        </div>

        {/* AI Assistant button — right */}
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button
            onClick={() => setIsAIOpen(!isAIOpen)}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '0.6rem 1.4rem',
              background: isAIOpen ? 'white' : 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
              color: isAIOpen ? '#4f46e5' : 'white', fontWeight: 800, fontSize: '1rem',
              borderRadius: '0.75rem', border: 'none', cursor: 'pointer',
              boxShadow: isAIOpen ? 'inset 0 0 0 1.5px #c7d2fe, 0 4px 12px rgba(79,70,229,0.1)' : '0 4px 18px rgba(79,70,229,0.35)',
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = isAIOpen ? 'inset 0 0 0 1.5px #a5b4fc, 0 6px 16px rgba(79,70,229,0.15)' : '0 8px 24px rgba(79,70,229,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isAIOpen ? 'inset 0 0 0 1.5px #c7d2fe, 0 4px 12px rgba(79,70,229,0.1)' : '0 4px 18px rgba(79,70,229,0.35)'; }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {!isAIOpen && (
                <>
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', opacity: 0.8, animation: 'ping 1.5s ease-out infinite' }}></div>
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: '#0ea5e9' }}></div>
                </>
              )}
              <span style={{ fontSize: '1.2rem', marginRight: '0.4rem' }}>🤖</span>
            </div>
            <span>{isAIOpen ? '收起助教' : 'AI 助教'}</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
