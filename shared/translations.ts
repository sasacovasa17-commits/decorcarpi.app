/**
 * Sistem de traduceri pentru aplicație
 * Limba implicită: Italiană
 */

export type Language = 'it' | 'ro' | 'en';

export const translations = {
  it: {
    // UI Labels
    home: 'Home',
    ispirazioneDC: 'Ispirazione D.C.',
    vernice: 'Vernice',
    combinaStili: 'Combina Stili',
    miei: 'Miei',
    impostazioni: 'Impostazioni',
    contatti: 'Contatti',
    
    // Buttons
    avanti: 'Avanti',
    indietro: 'Indietro',
    salva: 'Salva',
    scarica: 'Scarica',
    riprova: 'Riprova',
    iniziora: 'Inizia ora',
    genera: 'Genera',
    annulla: 'Annulla',
    conferma: 'Conferma',
    
    // Messages
    caricamento: 'Caricamento...',
    generazione: 'Generazione in corso...',
    errore: 'Errore',
    successo: 'Successo',
    attenzione: 'Attenzione',
    informazione: 'Informazione',
    
    // Ispirazione D.C.
    fotografaLaTuaStanza: 'Fotografa la tua stanza',
    scattaUnaFoto: 'Scatta una foto della camera che vuoi decorare, oppure carica un\'immagine dalla galleria del tuo telefono.',
    galleria: 'Galleria',
    camera: 'Camera',
    saltaIntroduzione: 'Salta introduzione',
    
    // Descriptions
    descrizioneStuccoVeneziano: 'Per una \'sala\' con una \'parete principale\' e illuminazione \'naturale\', \'Stucco Veneziano Lucido\' in \'Terra di Siena Bruciata\' (#8B4513) è una scelta squisita. Lo stile classico italiano è perfettamente completato dall\'eleganza intrinseca e dal significato storico dello Stucco Veneziano. La finitura lucida, ispirata dalla qualità dell\'artigianato visto nel portfolio di Decor Carpi, interagirà dinamicamente con la luce naturale, evidenziando l\'importanza della parete senza sovraccaricare lo spazio. Il marrone profondo e caldo di \'Terra di Siena Bruciata\' si allinea con la preferenza di colore dell\'utente e fonda la stanza con una sofisticazione senza tempo, migliorando la sensazione lussuosa senza essere eccessivamente ostentato.',
    trend2026: 'Tendenza 2026: Per il 2026, le finiture di lusso italiana stanno abbracciando \'Quiet Luxury\' e \'Biophilic Integration\'. Lo Stucco Veneziano, in particolare in tonalità terrose come \'Terra di Siena Bruciata\', incarna perfettamente queste tendenze fornendo un\'eleganza sofisticata e sottile che si connette con elementi naturali. La tendenza enfatizza esperienze tattili e finiture che offrono profondità visiva e un senso di permanenza, allontanandosi dalle tendenze effimere verso l\'artigianato duraturo. La riflettività sottile dello stucco si allinea anche con la crescente tendenza di \'Dynamic Surfaces\' che interagiscono con la luce durante il giorno, portando vita e movimento agli spazi interni.',
    
    // Texture descriptions
    craquele: 'Texture craquelé con giochi di luce unici',
    filaSeta: 'Effetto setoso raffinato, luminoso',
    pietraZen: 'Texture di pietra naturale, calma ed eleganza',
    effettoCimento: 'Cemento decorativo moderno, stile industriale con linee diagonali',
    pelleElefante: 'Texture pelle di elefante, profondità e carattere',
    stencil: 'Effetto 3D sofisticato, eleganza e modernità',
    effettoPerlato: 'Riflessi perlati, superficie viva e luminosa',
    pietraSpaccata: 'Pietra naturale spaccata, carattere e profondità',
    stuccoVeneziano: 'Stucco veneziano classico, eleganza e sofisticazione',
    
    // Watermark
    watermarkText: 'decor carpi',
  },
  ro: {
    // UI Labels
    home: 'Acasă',
    ispirazioneDC: 'Inspirație D.C.',
    vernice: 'Vopsea',
    combinaStili: 'Combină Stiluri',
    miei: 'Ai mei',
    impostazioni: 'Setări',
    contatti: 'Contacte',
    
    // Buttons
    avanti: 'Înainte',
    indietro: 'Înapoi',
    salva: 'Salvează',
    scarica: 'Descarcă',
    riprova: 'Încearcă din nou',
    iniziora: 'Începe acum',
    genera: 'Generează',
    annulla: 'Anulează',
    conferma: 'Confirmă',
    
    // Messages
    caricamento: 'Se încarcă...',
    generazione: 'Se generează...',
    errore: 'Eroare',
    successo: 'Succes',
    attenzione: 'Atenție',
    informazione: 'Informație',
    
    // Ispirazione D.C.
    fotografaLaTuaStanza: 'Fotografiază camera ta',
    scattaUnaFoto: 'Fă o fotografie a camerei pe care vrei s-o decorezi, sau încarcă o imagine din galeria telefonului tău.',
    galleria: 'Galerie',
    camera: 'Cameră',
    saltaIntroduzione: 'Sări introducerea',
    
    // Descriptions
    descrizioneStuccoVeneziano: 'Pentru o \'cameră\' cu o \'perete principală\' și iluminare \'naturală\', \'Stucco Venetian Lustruit\' în \'Pământ de Siena Ars\' (#8B4513) este o alegere excelentă. Stilul clasic italian este perfect completat de eleganța intrinsecă și semnificația istorică a Stucco Venetian. Finisajul lustruit, inspirat de calitatea meșteșugului văzut în portofoliul Decor Carpi, va interacționa dinamic cu lumina naturală, evidențiind importanța peretelui fără a supraîncărca spațiul. Maro profund și cald al \'Pământului de Siena Ars\' se aliniază cu preferința de culoare a utilizatorului și ancoră camera cu o sofisticație fără timp, îmbunătățind senzația de lux fără a fi excesiv de ostentativ.',
    trend2026: 'Tendință 2026: Pentru 2026, finisajele de lux italian embracing \'Quiet Luxury\' și \'Biophilic Integration\'. Stucco Venetian, în special în tonuri pământii cum ar fi \'Pământ de Siena Ars\', încarnează perfect aceste tendințe oferind o eleganță sofisticată și subtilă care se conectează cu elemente naturale. Tendința pune accent pe experiențe tactile și finisaje care oferă profunzime vizuală și un sens de permanență, depărtând-se de tendințele trecătoare către meșteșugul durabil. Reflectivitatea subtilă a stucco se aliniază, de asemenea, cu tendința în creștere a \'Dynamic Surfaces\' care interacționează cu lumina pe parcursul zilei, aducând viață și mișcare în spații interioare.',
    
    // Texture descriptions
    craquele: 'Textură craquelé cu jocuri de lumină unice',
    filaSeta: 'Efect de mătase rafinat, luminos',
    pietraZen: 'Textură de piatră naturală, calm și eleganță',
    effettoCimento: 'Ciment decorativ modern, stil industrial cu linii diagonale',
    pelleElefante: 'Textură de piele de elefant, profunzime și caracter',
    stencil: 'Efect 3D sofisticat, eleganță și modernitate',
    effettoPerlato: 'Reflexii perlate, suprafață vie și luminoasă',
    pietraSpaccata: 'Piatră naturală spartă, caracter și profunzime',
    stuccoVeneziano: 'Stucco venetian clasic, eleganță și sofisticație',
    
    // Watermark
    watermarkText: 'decor carpi',
  },
  en: {
    // UI Labels
    home: 'Home',
    ispirazioneDC: 'Inspiration D.C.',
    vernice: 'Paint',
    combinaStili: 'Combine Styles',
    miei: 'My',
    impostazioni: 'Settings',
    contatti: 'Contacts',
    
    // Buttons
    avanti: 'Next',
    indietro: 'Back',
    salva: 'Save',
    scarica: 'Download',
    riprova: 'Try Again',
    iniziora: 'Start Now',
    genera: 'Generate',
    annulla: 'Cancel',
    conferma: 'Confirm',
    
    // Messages
    caricamento: 'Loading...',
    generazione: 'Generating...',
    errore: 'Error',
    successo: 'Success',
    attenzione: 'Warning',
    informazione: 'Information',
    
    // Ispirazione D.C.
    fotografaLaTuaStanza: 'Photograph Your Room',
    scattaUnaFoto: 'Take a photo of the room you want to decorate, or upload an image from your phone gallery.',
    galleria: 'Gallery',
    camera: 'Camera',
    saltaIntroduzione: 'Skip Introduction',
    
    // Descriptions
    descrizioneStuccoVeneziano: 'For a \'room\' with a \'main wall\' and \'natural\' lighting, \'Polished Venetian Stucco\' in \'Burnt Siena Earth\' (#8B4513) is an exquisite choice. The classic Italian style is perfectly complemented by the inherent elegance and historical significance of Venetian Stucco. The polished finish, inspired by the craftsmanship quality seen in Decor Carpi\'s portfolio, will interact dynamically with natural light, highlighting the wall\'s importance without overwhelming the space. The deep, warm brown of \'Burnt Siena Earth\' aligns with the user\'s color preference and grounds the room with timeless sophistication, enhancing the luxurious feel without being overtly ostentatious.',
    trend2026: 'Trend 2026: For 2026, luxury Italian finishes are embracing \'Quiet Luxury\' and \'Biophilic Integration\'. Venetian Stucco, particularly in earthy tones like \'Burnt Siena Earth\', perfectly embodies these trends by providing a sophisticated, understated elegance that connects with natural elements. The trend emphasizes tactile experiences and finishes that offer visual depth and a sense of permanence, moving away from fleeting fads towards enduring craftsmanship. The subtle reflectivity of the stucco also aligns with the growing trend of \'Dynamic Surfaces\' that interact with light throughout the day, bringing life and movement to interior spaces.',
    
    // Texture descriptions
    craquele: 'Craquelé texture with unique light play',
    filaSeta: 'Refined silky effect, luminous',
    pietraZen: 'Natural stone texture, calm and elegance',
    effettoCimento: 'Modern decorative cement, industrial style with diagonal lines',
    pelleElefante: 'Elephant skin texture, depth and character',
    stencil: 'Sophisticated 3D effect, elegance and modernity',
    effettoPerlato: 'Pearlescent reflections, vivid and luminous surface',
    pietraSpaccata: 'Split natural stone, character and depth',
    stuccoVeneziano: 'Classic Venetian stucco, elegance and sophistication',
    
    // Watermark
    watermarkText: 'decor carpi',
  },
} as const;

/**
 * Hook pentru a obține traduceri
 * @param lang - Limba selectată (default: 'it')
 * @returns Obiectul cu traduceri
 */
export function getTranslations(lang: Language = 'it') {
  return translations[lang];
}

/**
 * Funcție pentru a obține o traducere specifică
 * @param key - Cheia traducerii
 * @param lang - Limba selectată (default: 'it')
 * @returns Textul tradus
 */
export function t(key: keyof typeof translations.it, lang: Language = 'it'): string {
  return (translations[lang] as any)[key] || (translations.it as any)[key] || key;
}
