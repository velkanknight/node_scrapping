// Importa o puppeteer-extra, uma versão estendida do Puppeteer com plugins adicionais
const puppeteer = require('puppeteer-extra');
// Importa o plugin Stealth que ajuda a evitar detecção de automação por sites
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// Ativa o plugin Stealth para mascarar que estamos usando automação
puppeteer.use(StealthPlugin());

// Função utilitária para criar delays/pausas no código
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Função principal para fazer web scraping de voos no site seats.aero
// Recebe parâmetros: origem, destino e data de partida
const scrapeFlights = async ({ origin, destination, departureDate }) => {
  // Inicializa o navegador Puppeteer com configurações específicas
  const browser = await puppeteer.launch({
    headless: true, // Executa sem interface gráfica (invisível)
    defaultViewport: null, // Usa viewport padrão
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Argumentos para ambiente Docker/Linux
  });

  // Cria uma nova aba/página no navegador
  const page = await browser.newPage();

  try {
    console.log('Acessando o site...');
    // Navega para o site seats.aero e aguarda até a rede ficar inativa
    await page.goto('https://seats.aero/search', { waitUntil: 'networkidle2' });

    console.log('Simulando comportamento humano...');
    // Move o mouse para simular comportamento humano e evitar detecção de bot
    await page.mouse.move(100, 100);
    // Aguarda 6 segundos para simular tempo de carregamento humano
    await delay(6000);

    // Verifica se existe um captcha na página
    const captchaSelector = 'p#TBuuD2.h2.spacer-bottom';
    const captchaExists = await page.$(captchaSelector);
    if (captchaExists) {
      console.log('Captcha detectado. Tentando resolver...');
      // Se encontrou captcha, procura pelo checkbox para resolver
      const checkboxSelector = 'label.cb-lb input[type="checkbox"]';
      await page.waitForSelector(checkboxSelector, { timeout: 10000 });
      await page.click(checkboxSelector);
      console.log('Captcha resolvido com sucesso.');
      await delay(5000); // Aguarda 5 segundos após resolver o captcha
    }

    console.log('Preenchendo campo de origem...');
    // Aguarda o campo de origem aparecer na página
    await page.waitForSelector('input.vs__search[aria-labelledby="vs1__combobox"]');
    // Clica no campo de origem
    await page.click('input.vs__search[aria-labelledby="vs1__combobox"]');
    // Digita cada caractere da origem com delay para simular digitação humana
    for (const char of origin) await page.keyboard.type(char, { delay: 200 });
    await delay(1500); // Aguarda 1.5 segundos
    await page.keyboard.press('Enter'); // Pressiona Enter para confirmar
    await delay(2000); // Aguarda 2 segundos

    console.log('Preenchendo campo de destino...');
    // Aguarda o campo de destino aparecer na página
    await page.waitForSelector('input.vs__search[aria-labelledby="vs2__combobox"]');
    // Clica no campo de destino
    await page.click('input.vs__search[aria-labelledby="vs2__combobox"]');
    // Digita cada caractere do destino com delay para simular digitação humana
    for (const char of destination) await page.keyboard.type(char, { delay: 200 });
    await delay(1500); // Aguarda 1.5 segundos
    await page.keyboard.press('Enter'); // Pressiona Enter para confirmar
    await delay(2000); // Aguarda 2 segundos

    console.log('Selecionando data...');
    // Divide a data recebida (formato YYYY-MM-DD) em ano, mês e dia
    const [year, month, day] = departureDate.split('-');
    // Aguarda o campo de data aparecer e clica nele
    await page.waitForSelector('input[data-test-id="dp-input"]');
    await page.click('input[data-test-id="dp-input"]');
    await delay(1000);

    // Seleciona o ano no seletor de data
    await page.click('button[data-dp-element="overlay-year"]');
    await delay(500);
    await page.click(`div[data-test-id="${year}"]`);
    await delay(1000);

    // Seleciona o mês no seletor de data
    await page.click('button[data-dp-element="overlay-month"]');
    await delay(500);
    // Array com abreviações dos meses para conversão
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Converte número do mês para abreviação e clica
    await page.click(`div[data-test-id="${monthNames[parseInt(month, 10) - 1]}"]`);
    await delay(1000);

    // Seleciona o dia específico no calendário
    const daySelector = `div.dp__cell_inner.dp__pointer`;
    const days = await page.$$(daySelector); // Busca todos os elementos de dia
    // Itera através de todos os dias visíveis no calendário
    for (const element of days) {
      // Obtém o texto do elemento (número do dia)
      const text = await page.evaluate((el) => el.textContent.trim(), element);
      // Se encontrou o dia correto, clica nele
      if (text === day) {
        await element.click();
        console.log(`Dia ${day} selecionado com sucesso.`);
        break; // Sai do loop após encontrar e clicar no dia
      }
    }
    await delay(2000); // Aguarda 2 segundos após seleção da data

    console.log('Clicando no botão "Buscar"...');
    // Clica no botão de busca para executar a pesquisa de voos
    await page.click('button#submitSearch');
    await delay(3000); // Aguarda 3 segundos para carregamento dos resultados

    // Verifica se apareceu algum alerta de erro ou aviso
    const alertSelector = '.alert.alert-warning';
    const alertExists = await page.$(alertSelector);
    if (alertExists) {
      // Se encontrou alerta, extrai a mensagem e retorna
      const alertMessage = await page.evaluate((alert) => alert.textContent.trim(), alertExists);
      console.log(`Alerta encontrado: ${alertMessage}`);
      return { result: alertMessage };
    }

    console.log('Tentando clicar no botão "Econômica"...');
    // Procura e clica na coluna/aba de classe econômica nos resultados
    const economySelector = 'th[aria-label*="Economy"] span';
    await page.waitForSelector(economySelector, { timeout: 15000 });
    await page.click(economySelector);
    console.log('Botão "Econômica" clicado.');
    await delay(2000); // Aguarda 2 segundos após clicar na classe econômica

    console.log('Clicando no botão de mais informações...');
    // Procura pelos botões que abrem modal com mais informações sobre os voos
    const infoButtonSelector = 'button.open-modal-btn';
    await page.waitForSelector(infoButtonSelector, { timeout: 20000 });
    const infoButtons = await page.$$(infoButtonSelector); // Busca todos os botões disponíveis

    // Se encontrou pelo menos um botão de informações
    if (infoButtons.length > 0) {
      // Clica no primeiro botão de mais informações
      await infoButtons[0].click();
      console.log('Botão de mais informações clicado.');
      await delay(5000); // Aguarda 5 segundos para o modal carregar

      console.log('Extraindo links do pop-up...');
      // Procura pelos links de reserva dentro do modal/popup
      const linkSelector = '#bookingOptions a.dropdown-item';
      await page.waitForSelector(linkSelector, { timeout: 20000 });
      // Extrai todos os links encontrados, pegando texto e URL
      const links = await page.$$eval(linkSelector, (elements) =>
        elements.map((el) => `${el.textContent.trim()}, Link:${el.href}`)
      );

      console.log('Links extraídos com sucesso.');
      return { result: links }; // Retorna os links encontrados
    } else {
      // Se não encontrou nenhum botão de informações
      console.error('Nenhum botão de mais informações encontrado.');
      return { result: 'Nenhum link de reserva encontrado.' };
    }
  } catch (error) {
    // Se ocorrer qualquer erro durante o processo, loga e relança o erro
    console.error('Erro durante o scraping:', error);
    throw error;
  } finally {
    // Sempre executa, mesmo em caso de erro - fecha o navegador para liberar recursos
    console.log('Fechando o navegador...');
    await browser.close();
  }
};

// Exporta a função para ser usada em outros arquivos
module.exports = { scrapeFlights };
