// components/footer.js
class KapFooter extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
        <footer>
          <div class="container">
            <div class="footer-content">
              <a href="/" class="logo">
                <div class="logo-icon">K</div>
                Kap Raporu
              </a>
              <div class="footer-info">
                Veriler günlük olarak güncellenmektedir.
              </div>
            </div>
            <div class="disclaimer">
              Yasal Uyarı: KapRaporu.com'da yer alan bilgiler Kamuoyu Aydınlatma Platformu'ndan (KAP) alınmaktadır ve yalnızca bilgilendirme amaçlıdır. Yatırım tavsiyesi değildir. Finansal kararlarınızdan önce profesyonel danışmanlık almanız önerilir. Verilerin doğruluğu ve güncelliği konusunda garanti verilmez.
            </div>
          </div>
        </footer>
      `;
    }
  }
  
  customElements.define('kap-footer', KapFooter);