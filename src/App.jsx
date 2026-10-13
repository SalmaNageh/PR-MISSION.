import './App.css'
import Challenge from './components/Challenge'
import logo from './assets/enactus-logo-6.png'
function App() {
  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="brand-lockup">
          <img src={logo} alt="Enactus" className="enactus-logo"

          />

  <span className="brand-divider"></span>

  <div className="logo">
    <span>PR</span> MISSION
  </div>
</div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#learn">Learn</a>
          <a href="#challenge">Challenge</a>
        </div>

        <button
          className="nav-button"
          type="button"
          onClick={() => {
            document.getElementById('challenge')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }}
        >
          Start Mission
        </button>
           </nav>


      {/* Hero */}
      <section id="home" className="hero">

        <div className="hero-content">

          <p className="eyebrow">
            PR TRAINING EXPERIENCE
          </p>

          <h1>
            Think Like a
            <span> PR Manager.</span>
          </h1>

          <p className="hero-description">
            Learn how to identify the right relationship,
            approach companies, and make smarter PR decisions.
          </p>

          <div className="hero-buttons">

            <a href="#learn" className="primary-button">
              Start Learning →
            </a>

            <a href="#challenge" className="secondary-button">
              Try a Challenge
            </a>

          </div>

        </div>


        <div className="hero-visual">

          <div className="mission-card">

            <div className="card-top">
              <span>PR MISSION</span>
              <span>01</span>
            </div>

            <h3>
              Choose the right
              <br />
              relationship.
            </h3>

            <div className="mini-options">

              <div className="mini-option sponsor">
                <span>01</span>
                Sponsor
              </div>

              <div className="mini-option partner">
                <span>02</span>
                Partner
              </div>

              <div className="mini-option csr">
                <span>03</span>
                CSR
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* Learn */}
      <section id="learn" className="learn-section">

        <div className="section-heading">

          <p className="eyebrow">
            STEP 01
          </p>

          <h2>
            First, know your
            <span> relationships.</span>
          </h2>

          <p>
            Before approaching a company, you need to understand
            what kind of relationship you're trying to build.
          </p>

        </div>


        <div className="relationship-grid">

          {/* Sponsor */}
          <article className="relationship-card sponsor-card">

            <div className="card-number">
              01
            </div>

            <div className="relationship-icon">
              💰
            </div>

            <h3>Sponsor</h3>

            <p className="definition">
              A company provides financial or material support
              to an event or activity in exchange for visibility,
              branding, or promotional benefits.
            </p>

            <div className="divider"></div>

            <h4>Think about</h4>

            <ul>
              <li>Money or material support</li>
              <li>Brand visibility</li>
              <li>Marketing exposure</li>
              <li>Event promotion</li>
            </ul>

            <div className="example-box">
              <strong>Example</strong>
              <p>
                A telecom company supports a university hackathon
                financially and gets branding across the event.
              </p>
            </div>

          </article>


          {/* Partner */}
          <article className="relationship-card partner-card">

            <div className="card-number">
              02
            </div>

            <div className="relationship-icon">
              🤝
            </div>

            <h3>Partner</h3>

            <p className="definition">
              A company works with the team to achieve a shared
              goal where both sides contribute value and benefit
              from the relationship.
            </p>

            <div className="divider"></div>

            <h4>Think about</h4>

            <ul>
              <li>Mutual benefit</li>
              <li>Products or services</li>
              <li>Shared activities</li>
              <li>Long-term collaboration</li>
            </ul>

            <div className="example-box">
              <strong>Example</strong>
              <p>
                A restaurant provides food and discounts for
                a university event while reaching students.
              </p>
            </div>

          </article>


          {/* CSR */}
          <article className="relationship-card csr-card">

            <div className="card-number">
              03
            </div>

            <div className="relationship-icon">
              🌱
            </div>

            <h3>CSR</h3>

            <p className="definition">
              Corporate Social Responsibility focuses on creating
              positive social, environmental, or community impact.
            </p>

            <div className="divider"></div>

            <h4>Think about</h4>

            <ul>
              <li>Education</li>
              <li>Health</li>
              <li>Community development</li>
              <li>Environmental impact</li>
            </ul>

            <div className="example-box">
              <strong>Example</strong>
              <p>
                A bank supports a financial literacy initiative
                for students as part of its community impact.
              </p>
            </div>

          </article>

        </div>

      </section>


      {/* Difference */}
      <section className="difference-section">

        <div className="section-heading">

          <p className="eyebrow">
            THE KEY DIFFERENCE
          </p>

          <h2>
            Don't just know the terms.
            <span> Understand the strategy.</span>
          </h2>

        </div>


        <div className="comparison">

          <div className="comparison-header">
            <span>Relationship</span>
            <span>Main Goal</span>
            <span>Think About</span>
          </div>

          <div className="comparison-row">
            <strong>Sponsor</strong>
            <span>Brand Exposure</span>
            <span>Marketing & Visibility</span>
          </div>

          <div className="comparison-row">
            <strong>Partner</strong>
            <span>Mutual Value</span>
            <span>What both sides gain</span>
          </div>

          <div className="comparison-row">
            <strong>CSR</strong>
            <span>Social Impact</span>
            <span>Community & Responsibility</span>
          </div>

        </div>


        <div className="golden-rule">

          <div className="rule-icon">
            💡
          </div>

          <div>
            <p className="rule-label">
              THE GOLDEN RULE
            </p>

            <h3>
              Don't ask "What type of company is this?"
            </h3>

            <p>
              Ask:
              <strong>
                "What kind of relationship makes sense
                for this specific opportunity?"
              </strong>
            </p>
          </div>

        </div>

      </section>


      {/* Challenge */}
   
      <section id="challenge">

      <Challenge />

      </section>

      <footer>
        <p>
          PR MISSION
        </p>

        <span>
          Learn. Decide. Build Relationships.
        </span>
      </footer>

    </div>
  )
}

export default App