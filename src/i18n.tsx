import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "es" | "fr" | "de" | "pt" | "pcm";

const translations: Record<string, Partial<Record<Language, string>>> = {
  "Home": { es: "Inicio", fr: "Accueil", de: "Startseite", pt: "Início", pcm: "Home" },
  "Work": { es: "Proyectos", fr: "Projets", de: "Projekte", pt: "Projetos", pcm: "Wok" },
  "Resources": { es: "Recursos", fr: "Ressources", de: "Ressourcen", pt: "Recursos", pcm: "Resources" },
  "Team": { es: "Equipo", fr: "Équipe", de: "Team", pt: "Equipa", pcm: "Di team" },
  "Contact": { es: "Contacto", fr: "Contact", de: "Kontakt", pt: "Contacto", pcm: "Contact" },
  "Build With Us": { es: "Construye con nosotros", fr: "Construisons ensemble", de: "Gemeinsam bauen", pt: "Construa connosco", pcm: "Make we build" },
  "Select language": { es: "Seleccionar idioma", fr: "Choisir la langue", de: "Sprache auswählen", pt: "Selecionar idioma", pcm: "Choose language" },
  "Close navigation": { es: "Cerrar navegación", fr: "Fermer la navigation", de: "Navigation schließen", pt: "Fechar navegação", pcm: "Close menu" },
  "Open navigation": { es: "Abrir navegación", fr: "Ouvrir la navigation", de: "Navigation öffnen", pt: "Abrir navegação", pcm: "Open menu" },
  "Baseline home": { es: "Inicio de Baseline", fr: "Accueil de Baseline", de: "Baseline-Startseite", pt: "Início da Baseline", pcm: "Baseline home" },
  "Main navigation": { es: "Navegación principal", fr: "Navigation principale", de: "Hauptnavigation", pt: "Navegação principal", pcm: "Main navigation" },
  "Collaborate": { es: "Colabora", fr: "Collaborer", de: "Zusammenarbeiten", pt: "Colabore", pcm: "Make we work together" },
  "Build": { es: "Construye", fr: "Construisez", de: "Baue", pt: "Construa", pcm: "Build" },
  "and": { es: "y", fr: "et", de: "und", pt: "e", pcm: "and" },
  "Succeed with": { es: "alcanza el éxito con", fr: "réussir avec", de: "erfolgreich sein mit", pt: "tenha sucesso com", pcm: "succeed with" },
  "and Succeed with": { es: "y alcanza el éxito con", fr: "et réussir avec", de: "und erfolgreich sein mit", pt: "e tenha sucesso com", pcm: "and succeed with" },
  "We build products, improve how engineering is practised and make engineering & artificial intelligence accessible to everyone.": {
    es: "Creamos productos, mejoramos la práctica de la ingeniería y hacemos que la ingeniería y la inteligencia artificial sean accesibles para todos.",
    fr: "Nous créons des produits, faisons progresser les pratiques d’ingénierie et rendons l’ingénierie et l’intelligence artificielle accessibles à tous.",
    de: "Wir entwickeln Produkte, verbessern die Ingenieurpraxis und machen Technik und künstliche Intelligenz für alle zugänglich.",
    pt: "Criamos produtos, melhoramos a prática da engenharia e tornamos a engenharia e a inteligência artificial acessíveis a todos.",
    pcm: "We dey build products, make engineering better, and make engineering and AI easy for everybody to access.",
  },
  "An independent engineering collective.": { es: "Un colectivo independiente de ingeniería.", fr: "Un collectif d’ingénierie indépendant.", de: "Ein unabhängiges Engineering-Kollektiv.", pt: "Um coletivo independente de engenharia.", pcm: "One independent engineering collective." },
  "Baseline is an independent, open-source engineering collective focused on building products, improving how engineering is practised and making engineering and artificial intelligence more accessible.": {
    es: "Baseline es un colectivo independiente de ingeniería y código abierto que crea productos, mejora la práctica de la ingeniería y hace más accesibles la ingeniería y la inteligencia artificial.",
    fr: "Baseline est un collectif indépendant d’ingénierie open source qui crée des produits, améliore les pratiques d’ingénierie et rend l’ingénierie et l’intelligence artificielle plus accessibles.",
    de: "Baseline ist ein unabhängiges Open-Source-Engineering-Kollektiv. Wir entwickeln Produkte, verbessern die Engineering-Praxis und machen Technik und künstliche Intelligenz zugänglicher.",
    pt: "Baseline é um coletivo independente de engenharia e código aberto que cria produtos, melhora as práticas de engenharia e torna a engenharia e a inteligência artificial mais acessíveis.",
    pcm: "Baseline na independent open-source engineering collective. We dey build products, improve how people dey practise engineering, and make engineering and AI easier to reach.",
  },
  "We believe everyone should have a clear path into engineering. Whether someone is taking their first steps into technology or already building complex systems, Baseline provides the knowledge, resources, tools and opportunities to help them grow.": {
    es: "Creemos que todos deben tener un camino claro hacia la ingeniería. Tanto si alguien comienza en tecnología como si ya crea sistemas complejos, Baseline ofrece conocimientos, recursos, herramientas y oportunidades para crecer.",
    fr: "Nous pensons que chacun doit pouvoir accéder clairement aux métiers de l’ingénierie. Que l’on débute dans la tech ou que l’on crée déjà des systèmes complexes, Baseline apporte les connaissances, les ressources, les outils et les occasions de progresser.",
    de: "Wir glauben, dass alle einen klaren Weg in die Technik brauchen. Ob am Anfang der Tech-Laufbahn oder bereits beim Bau komplexer Systeme: Baseline bietet Wissen, Ressourcen, Werkzeuge und Chancen zur Weiterentwicklung.",
    pt: "Acreditamos que todos devem ter um caminho claro para a engenharia. Quer alguém esteja a dar os primeiros passos na tecnologia ou já construa sistemas complexos, a Baseline oferece conhecimento, recursos, ferramentas e oportunidades para crescer.",
    pcm: "We believe say everybody suppose get clear road enter engineering. Whether person just dey start for tech or dey build complex systems already, Baseline dey provide knowledge, resources, tools and chances to grow.",
  },
  "Project Tools & Software": { es: "Herramientas y software de proyectos", fr: "Outils et logiciels de projet", de: "Projektwerkzeuge und Software", pt: "Ferramentas e software de projetos", pcm: "Project tools and software" },
  "Our Satisfied Users": { es: "Usuarios satisfechos", fr: "Utilisateurs satisfaits", de: "Zufriedene Nutzer", pt: "Utilizadores satisfeitos", pcm: "People wey like wetin we build" },
  "Task Management Updates": { es: "Actualizaciones de gestión de tareas", fr: "Mises à jour de gestion des tâches", de: "Updates zur Aufgabenverwaltung", pt: "Atualizações de gestão de tarefas", pcm: "Task management updates" },
  "Office in Countries": { es: "Países con presencia", fr: "Pays où nous sommes présents", de: "Länder mit Präsenz", pt: "Países onde estamos presentes", pcm: "Countries we dey reach" },
  "Live site": { es: "Sitio web", fr: "Site en ligne", de: "Live-Website", pt: "Site online", pcm: "Live site" },
  "We build and launch products, contribute to open-source projects, share what we learn and create opportunities for people to take part in meaningful engineering work.": {
    es: "Creamos y lanzamos productos, contribuimos a proyectos de código abierto, compartimos lo que aprendemos y ofrecemos oportunidades para participar en un trabajo de ingeniería significativo.",
    fr: "Nous créons et lançons des produits, contribuons à des projets open source, partageons nos apprentissages et ouvrons des possibilités de participer à un travail d’ingénierie utile.",
    de: "Wir entwickeln und veröffentlichen Produkte, tragen zu Open-Source-Projekten bei, teilen unsere Erkenntnisse und schaffen Möglichkeiten für sinnvolle Engineering-Arbeit.",
    pt: "Criamos e lançamos produtos, contribuímos para projetos de código aberto, partilhamos o que aprendemos e criamos oportunidades para participar em trabalho de engenharia com impacto.",
    pcm: "We dey build and launch products, contribute to open-source projects, share wetin we learn, and create chances for people to do meaningful engineering work.",
  },
  "next generation of engineers": { es: "próxima generación de ingenieros", fr: "nouvelle génération d’ingénieurs", de: "nächste Generation von Ingenieuren", pt: "próxima geração de engenheiros", pcm: "next generation of engineers" },
  "View All Projects": { es: "Ver todos los proyectos", fr: "Voir tous les projets", de: "Alle Projekte ansehen", pt: "Ver todos os projetos", pcm: "See all projects" },
  "The gate is rarely the talent.": { es: "El talento rara vez es el obstáculo.", fr: "Le talent est rarement le problème.", de: "Talent ist selten das Hindernis.", pt: "O talento raramente é o obstáculo.", pcm: "Na talent dey block person most times." },
  "The same four walls show up wherever engineering is taught, hired or credited. We build around them instead of building on top of them.": {
    es: "Las mismas barreras aparecen donde se enseña, se contrata o se reconoce la ingeniería. Creamos vías para sortearlas, no para reforzarlas.",
    fr: "Les mêmes barrières existent partout où l’ingénierie s’enseigne, recrute ou se valorise. Nous construisons des voies pour les contourner plutôt que de les renforcer.",
    de: "Dieselben Hürden tauchen überall dort auf, wo Technik gelehrt, eingestellt oder anerkannt wird. Wir bauen Wege um sie herum, statt sie weiter zu verstärken.",
    pt: "As mesmas barreiras surgem onde a engenharia é ensinada, contratada ou reconhecida. Criamos caminhos à volta delas, em vez de as reforçar.",
    pcm: "Na same four walls dey show anywhere dem teach, hire or give engineers credit. We dey build road around them, no be on top of them.",
  },
  "Credentials first": { es: "Primero las credenciales", fr: "Les diplômes d’abord", de: "Zuerst die Abschlüsse", pt: "Credenciais primeiro", pcm: "Certificate first" },
  "Paywalled tools": { es: "Herramientas de pago", fr: "Outils payants", de: "Kostenpflichtige Werkzeuge", pt: "Ferramentas pagas", pcm: "Tools wey cost money" },
  "Closed systems": { es: "Sistemas cerrados", fr: "Systèmes fermés", de: "Geschlossene Systeme", pt: "Sistemas fechados", pcm: "Closed systems" },
  "No first project": { es: "Sin un primer proyecto", fr: "Pas de premier projet", de: "Kein erstes Projekt", pt: "Sem um primeiro projeto", pcm: "No first project" },
  "Understand it, improve it, build what comes next.": { es: "Entiéndelo, mejóralo y construye lo que sigue.", fr: "Comprendre, améliorer, construire la suite.", de: "Verstehen, verbessern und das Nächste bauen.", pt: "Compreender, melhorar e construir o que vem a seguir.", pcm: "Understand am, improve am, build wetin come next." },
  "Four to start. Open by design.": { es: "Cuatro para empezar. Abierto por diseño.", fr: "Quatre pour commencer. Ouvert par conception.", de: "Vier zum Start. Von Grund auf offen.", pt: "Quatro para começar. Aberto por princípio.", pcm: "Four to start. Open from the beginning." },
  "Baseline is a collective, not a founders' club. The four of us started it; every project here is open to contributors who want a real thing to work on.": {
    es: "Baseline es un colectivo, no un club de fundadores. Empezamos cuatro; cada proyecto está abierto a quienes quieran trabajar en algo real.",
    fr: "Baseline est un collectif, pas un club de fondateurs. Nous étions quatre au départ ; chaque projet est ouvert aux personnes qui veulent travailler sur quelque chose de concret.",
    de: "Baseline ist ein Kollektiv, kein Gründerclub. Wir haben zu viert angefangen; jedes Projekt steht allen offen, die an etwas Echtem arbeiten möchten.",
    pt: "A Baseline é um coletivo, não um clube de fundadores. Começámos quatro; todos os projetos estão abertos a quem queira trabalhar em algo real.",
    pcm: "Baseline na collective, no be founders club. Four of us start am; every project dey open to people wey wan work on real thing.",
  },
  "Visit": { es: "Visitar", fr: "Visiter", de: "Besuchen", pt: "Visitar", pcm: "Visit" },
  "Repositories": { es: "Repositorios", fr: "Dépôts", de: "Repositories", pt: "Repositórios", pcm: "Repositories" },
  "Contributions": { es: "Contribuciones", fr: "Contributions", de: "Beiträge", pt: "Contribuições", pcm: "Contributions" },
  "Followers": { es: "Seguidores", fr: "Abonnés", de: "Follower", pt: "Seguidores", pcm: "People wey follow" },
  "Get in Touch": { es: "Hablemos", fr: "Nous contacter", de: "Kontakt aufnehmen", pt: "Fale connosco", pcm: "Talk to us" },
  "Achieve Milestones": { es: "Alcanza tus objetivos", fr: "Atteignez vos objectifs", de: "Meilensteine erreichen", pt: "Alcance os seus objetivos", pcm: "Reach your milestones" },
  "Faster with": { es: "más rápido con", fr: "plus vite avec", de: "schneller mit", pt: "mais depressa com", pcm: "faster with" },
  "Working on something real, or want in on one of ours? We answer every message.": {
    es: "¿Trabajas en algo real o quieres sumarte a uno de nuestros proyectos? Respondemos a todos los mensajes.",
    fr: "Vous travaillez sur un projet concret ou souhaitez rejoindre l’un des nôtres ? Nous répondons à chaque message.",
    de: "Arbeitest du an etwas Echtem oder möchtest du bei einem unserer Projekte mitmachen? Wir beantworten jede Nachricht.",
    pt: "Está a trabalhar em algo real ou quer participar num dos nossos projetos? Respondemos a todas as mensagens.",
    pcm: "You dey work on something real, or wan join one of our own? We dey reply every message.",
  },
  "You’re on the list — we’ll be in touch.": { es: "Ya estás en la lista; nos pondremos en contacto.", fr: "Vous êtes sur la liste, nous vous contacterons.", de: "Du stehst auf der Liste – wir melden uns.", pt: "Já está na lista; entraremos em contacto.", pcm: "You don enter the list — we go reach you." },
  "Your email address": { es: "Tu correo electrónico", fr: "Votre adresse e-mail", de: "Deine E-Mail-Adresse", pt: "O seu endereço de e-mail", pcm: "Your email address" },
  "See More": { es: "Ver más", fr: "Voir plus", de: "Mehr anzeigen", pt: "Ver mais", pcm: "See more" },
  "We build, then we show the work.": { es: "Construimos y mostramos el trabajo.", fr: "Nous construisons, puis nous montrons le travail.", de: "Wir bauen und zeigen dann unsere Arbeit.", pt: "Construímos e mostramos o trabalho.", pcm: "We build am, then show the work." },
  "More on the workbench.": { es: "Más proyectos en marcha.", fr: "D’autres projets en cours.", de: "Mehr auf der Werkbank.", pt: "Mais projetos em curso.", pcm: "More work dey come." },
  "New projects land here as they go live. If you want in on one — or have something of your own — we answer every message.": {
    es: "Aquí publicamos los proyectos cuando están disponibles. Si quieres participar en uno o tienes una idea propia, respondemos a todos los mensajes.",
    fr: "Les nouveaux projets apparaissent ici dès leur lancement. Si vous souhaitez participer ou proposer votre idée, nous répondons à chaque message.",
    de: "Neue Projekte erscheinen hier, sobald sie starten. Wenn du mitmachen oder etwas Eigenes vorschlagen möchtest, beantworten wir jede Nachricht.",
    pt: "Os novos projetos aparecem aqui quando são lançados. Se quiser participar ou tiver uma ideia sua, respondemos a todas as mensagens.",
    pcm: "New projects go show here as dem launch. If you wan join or get your own idea, we dey reply every message.",
  },
  "Live site — designed, engineered and shipped in the open. Every project here is open to contributors who want a real thing to work on.": {
    es: "Productos en vivo, diseñados, desarrollados y publicados abiertamente. Cada proyecto está abierto a colaboradores que quieran trabajar en algo real.",
    fr: "Des produits en ligne, conçus, développés et publiés au grand jour. Chaque projet est ouvert aux personnes qui veulent travailler sur du concret.",
    de: "Live-Produkte, offen gestaltet, entwickelt und veröffentlicht. Jedes Projekt steht allen offen, die an etwas Echtem mitarbeiten möchten.",
    pt: "Produtos no ar, concebidos, desenvolvidos e lançados abertamente. Todos os projetos estão abertos a quem queira trabalhar em algo real.",
    pcm: "Products wey dey live, designed, built and shipped open. Every project dey open to people wey wan work on real thing.",
  },
  "Selected projects": { es: "Proyectos seleccionados", fr: "Projets sélectionnés", de: "Ausgewählte Projekte", pt: "Projetos selecionados", pcm: "Selected projects" },
  "Open the project live site": { es: "Abrir el sitio del proyecto", fr: "Ouvrir le site du projet", de: "Projektwebsite öffnen", pt: "Abrir o site do projeto", pcm: "Open the project site" },
  "Repository": { es: "Repositorio", fr: "Dépôt", de: "Repository", pt: "Repositório", pcm: "Repository" },
  "An open-source engineering collective": { es: "Un colectivo de ingeniería de código abierto", fr: "Un collectif d’ingénierie open source", de: "Ein Open-Source-Engineering-Kollektiv", pt: "Um coletivo de engenharia de código aberto", pcm: "One open-source engineering collective" },
  "The people": { es: "Las personas", fr: "L’équipe", de: "Das Team", pt: "As pessoas", pcm: "The people" },
  "Four of us to start. Room for you, too.": { es: "Empezamos cuatro. También hay sitio para ti.", fr: "Nous étions quatre au départ. Il y a aussi de la place pour vous.", de: "Wir haben zu viert angefangen. Für dich ist auch Platz.", pt: "Começámos quatro. Também há espaço para si.", pcm: "Four of us start. You fit join us too." },
  "You, maybe": { es: "Tú, quizás", fr: "Vous, peut-être", de: "Vielleicht du", pt: "Você, talvez", pcm: "Maybe na you" },
  "Build with us": { es: "Construye con nosotros", fr: "Construisez avec nous", de: "Bau mit uns", pt: "Construa connosco", pcm: "Build with us" },
  "Explore": { es: "Explorar", fr: "Explorer", de: "Entdecken", pt: "Explorar", pcm: "Explore" },
  "Pick an open project and help make it better. There’s room for you here.": { es: "Elige un proyecto abierto y ayúdanos a mejorarlo. Aquí hay sitio para ti.", fr: "Choisissez un projet ouvert et aidez-nous à l’améliorer. Vous avez votre place ici.", de: "Such dir ein offenes Projekt aus und hilf, es besser zu machen. Hier ist Platz für dich.", pt: "Escolha um projeto aberto e ajude a melhorá-lo. Há espaço para si aqui.", pcm: "Choose one open project make you help improve am. You get space here." },
  "Work with us,": { es: "Trabaja con nosotros,", fr: "Travaillons ensemble,", de: "Arbeite mit uns,", pt: "Trabalhe connosco,", pcm: "Work with us," },
  "or join us": { es: "o únete a nosotros", fr: "ou rejoignez-nous", de: "oder komm dazu", pt: "ou junte-se a nós", pcm: "or join us" },
  "One address reaches everyone in the collective — whether you want to build on something we've shipped, hand us a problem, or start contributing.": {
    es: "Una sola dirección llega a todo el colectivo, tanto si quieres ampliar algo que ya publicamos, proponernos un problema o empezar a contribuir.",
    fr: "Une seule adresse permet de joindre tout le collectif : pour prolonger un projet livré, nous confier un problème ou commencer à contribuer.",
    de: "Eine Adresse erreicht das ganze Kollektiv – ob du auf einem veröffentlichten Projekt aufbauen, uns ein Problem geben oder mitarbeiten möchtest.",
    pt: "Um único endereço chega a todo o coletivo — para continuar algo que lançámos, propor um problema ou começar a contribuir.",
    pcm: "One address go reach everybody for the collective — whether you wan build on wetin we don ship, bring us a problem, or start contributing.",
  },
  "Open to:": { es: "Abiertos a:", fr: "Ouverts à :", de: "Offen für:", pt: "Disponíveis para:", pcm: "We dey open to:" },
  "collaborations, contract work, open-source contributions, and people who want a real project to learn on.": {
    es: "colaboraciones, trabajos por contrato, contribuciones de código abierto y personas que quieran aprender con un proyecto real.",
    fr: "collaborations, missions contractuelles, contributions open source et personnes souhaitant apprendre sur un vrai projet.",
    de: "Zusammenarbeit, Auftragsarbeit, Open-Source-Beiträge und Menschen, die an einem echten Projekt lernen möchten.",
    pt: "colaborações, trabalho por contrato, contribuições de código aberto e pessoas que queiram aprender num projeto real.",
    pcm: "collaboration, contract work, open-source contribution, and people wey wan learn with real project.",
  },
  "What are you": { es: "¿En qué estás", fr: "Sur quoi", de: "Woran arbeitest", pt: "Em que está", pcm: "Wetin you" },
  "working on?": { es: "trabajando?", fr: "travaillez-vous ?", de: "du?", pt: "a trabalhar?", pcm: "dey work on?" },
  "Name": { es: "Nombre", fr: "Nom", de: "Name", pt: "Nome", pcm: "Name" },
  "Email": { es: "Correo electrónico", fr: "E-mail", de: "E-Mail", pt: "E-mail", pcm: "Email" },
  "What are you reaching out about?": { es: "¿Sobre qué nos escribes?", fr: "Quel est le sujet de votre message ?", de: "Worum geht es in deiner Nachricht?", pt: "Sobre o que nos está a contactar?", pcm: "Wetin you dey reach us about?" },
  "Select a topic": { es: "Selecciona un tema", fr: "Choisissez un sujet", de: "Thema auswählen", pt: "Selecione um assunto", pcm: "Choose topic" },
  "Collaboration": { es: "Colaboración", fr: "Collaboration", de: "Zusammenarbeit", pt: "Colaboração", pcm: "Collaboration" },
  "Contract work": { es: "Trabajo por contrato", fr: "Mission contractuelle", de: "Auftragsarbeit", pt: "Trabalho por contrato", pcm: "Contract work" },
  "Open-source contribution": { es: "Contribución de código abierto", fr: "Contribution open source", de: "Open-Source-Beitrag", pt: "Contribuição de código aberto", pcm: "Open-source contribution" },
  "A project to learn on": { es: "Un proyecto para aprender", fr: "Un projet pour apprendre", de: "Ein Lernprojekt", pt: "Um projeto para aprender", pcm: "Project to learn with" },
  "Something else": { es: "Otra cosa", fr: "Autre chose", de: "Etwas anderes", pt: "Outra coisa", pcm: "Something else" },
  "Your message": { es: "Tu mensaje", fr: "Votre message", de: "Deine Nachricht", pt: "A sua mensagem", pcm: "Your message" },
  "Tell us what you have in mind…": { es: "Cuéntanos qué tienes en mente…", fr: "Dites-nous ce que vous avez en tête…", de: "Erzähl uns, was du vorhast …", pt: "Diga-nos o que tem em mente…", pcm: "Tell us wetin dey your mind…" },
  "Send Message": { es: "Enviar mensaje", fr: "Envoyer le message", de: "Nachricht senden", pt: "Enviar mensagem", pcm: "Send message" },
  "Sending message": { es: "Enviando mensaje", fr: "Envoi du message", de: "Nachricht wird gesendet", pt: "A enviar mensagem", pcm: "Message dey send" },
  "Sending…": { es: "Enviando…", fr: "Envoi…", de: "Wird gesendet …", pt: "A enviar…", pcm: "E dey send…" },
  "Message sent successfully": { es: "Mensaje enviado correctamente", fr: "Message envoyé avec succès", de: "Nachricht erfolgreich gesendet", pt: "Mensagem enviada com sucesso", pcm: "Message don send well" },
  "Message Send Error": { es: "Error al enviar el mensaje", fr: "Erreur lors de l’envoi", de: "Fehler beim Senden der Nachricht", pt: "Erro ao enviar a mensagem", pcm: "Message no fit send" },
  "Please enter your name.": { es: "Escribe tu nombre.", fr: "Veuillez saisir votre nom.", de: "Bitte gib deinen Namen ein.", pt: "Introduza o seu nome.", pcm: "Abeg enter your name." },
  "Please enter your email address.": { es: "Escribe tu correo electrónico.", fr: "Veuillez saisir votre adresse e-mail.", de: "Bitte gib deine E-Mail-Adresse ein.", pt: "Introduza o seu endereço de e-mail.", pcm: "Abeg enter your email address." },
  "Enter a valid email address.": { es: "Escribe un correo electrónico válido.", fr: "Veuillez saisir une adresse e-mail valide.", de: "Bitte gib eine gültige E-Mail-Adresse ein.", pt: "Introduza um endereço de e-mail válido.", pcm: "Abeg enter correct email address." },
  "Choose a topic so we know what you’re reaching out about.": { es: "Elige un tema para saber por qué nos escribes.", fr: "Choisissez un sujet pour nous préciser la raison de votre message.", de: "Wähle ein Thema, damit wir wissen, worum es geht.", pt: "Escolha um assunto para sabermos o motivo do contacto.", pcm: "Choose topic make we know wetin you dey reach us about." },
  "Please add a message.": { es: "Escribe un mensaje.", fr: "Veuillez ajouter un message.", de: "Bitte füge eine Nachricht hinzu.", pt: "Adicione uma mensagem.", pcm: "Abeg add your message." },
  "All work": { es: "Todos los proyectos", fr: "Tous les projets", de: "Alle Projekte", pt: "Todos os projetos", pcm: "All work" },
  "Scroll to top": { es: "Volver arriba", fr: "Retour en haut", de: "Nach oben", pt: "Voltar ao topo", pcm: "Go top" },
  "Scope and method": { es: "Alcance y método", fr: "Périmètre et méthode", de: "Umfang und Methodik", pt: "Âmbito e método", pcm: "Scope and method" },
  "Source code hosting": { es: "Alojamiento de código fuente", fr: "Hébergement de code source", de: "Hosting für Quellcode", pt: "Alojamento de código-fonte", pcm: "Source code hosting" },
  "Continuous integration and delivery": { es: "Integración y entrega continuas", fr: "Intégration et livraison continues", de: "Kontinuierliche Integration und Bereitstellung", pt: "Integração e entrega contínuas", pcm: "Continuous integration and delivery" },
  "Testing and quality assurance": { es: "Pruebas y control de calidad", fr: "Tests et assurance qualité", de: "Tests und Qualitätssicherung", pt: "Testes e garantia de qualidade", pcm: "Testing and quality checks" },
  "Code quality and review": { es: "Calidad y revisión del código", fr: "Qualité et revue du code", de: "Codequalität und Review", pt: "Qualidade e revisão de código", pcm: "Code quality and review" },
  "Security and certificates": { es: "Seguridad y certificados", fr: "Sécurité et certificats", de: "Sicherheit und Zertifikate", pt: "Segurança e certificados", pcm: "Security and certificates" },
  "Monitoring and uptime": { es: "Monitorización y disponibilidad", fr: "Surveillance et disponibilité", de: "Überwachung und Verfügbarkeit", pt: "Monitorização e disponibilidade", pcm: "Monitoring and uptime" },
  "Logging and error tracking": { es: "Registros y seguimiento de errores", fr: "Journaux et suivi des erreurs", de: "Protokollierung und Fehlerverfolgung", pt: "Registos e acompanhamento de erros", pcm: "Logs and error tracking" },
  "Application hosting": { es: "Alojamiento de aplicaciones", fr: "Hébergement d’applications", de: "Anwendungshosting", pt: "Alojamento de aplicações", pcm: "Application hosting" },
  "Backend as a service": { es: "Backend como servicio", fr: "Backend en tant que service", de: "Backend as a Service", pt: "Backend como serviço", pcm: "Backend as a service" },
  "Managed data services": { es: "Servicios de datos gestionados", fr: "Services de données gérés", de: "Verwaltete Datendienste", pt: "Serviços de dados geridos", pcm: "Managed data services" },
  "Content delivery and DNS": { es: "Distribución de contenido y DNS", fr: "Diffusion de contenu et DNS", de: "Content Delivery und DNS", pt: "Distribuição de conteúdo e DNS", pcm: "Content delivery and DNS" },
  "Transactional email": { es: "Correo transaccional", fr: "E-mail transactionnel", de: "Transaktions-E-Mail", pt: "E-mail transacional", pcm: "Transactional email" },
  "Authentication and authorization": { es: "Autenticación y autorización", fr: "Authentification et autorisation", de: "Authentifizierung und Autorisierung", pt: "Autenticação e autorização", pcm: "Authentication and authorization" },
  "Storage and media": { es: "Almacenamiento y contenido multimedia", fr: "Stockage et médias", de: "Speicher und Medien", pt: "Armazenamento e multimédia", pcm: "Storage and media" },
  "Generative AI and machine learning": { es: "IA generativa y aprendizaje automático", fr: "IA générative et apprentissage automatique", de: "Generative KI und maschinelles Lernen", pt: "IA generativa e aprendizagem automática", pcm: "Generative AI and machine learning" },
  "Issue tracking and project management": { es: "Seguimiento de incidencias y gestión de proyectos", fr: "Suivi des problèmes et gestion de projet", de: "Issue-Tracking und Projektmanagement", pt: "Acompanhamento de problemas e gestão de projetos", pcm: "Issue tracking and project management" },
  "Caveats and sources": { es: "Notas y fuentes", fr: "Réserves et sources", de: "Hinweise und Quellen", pt: "Notas e fontes", pcm: "Notes and sources" },
  "Table of contents": { es: "Índice", fr: "Sommaire", de: "Inhaltsverzeichnis", pt: "Índice", pcm: "Contents" },
  "Free tools for open engineering": { es: "Herramientas gratuitas para ingeniería abierta", fr: "Outils gratuits pour l’ingénierie ouverte", de: "Kostenlose Tools für offene Technik", pt: "Ferramentas gratuitas para engenharia aberta", pcm: "Free tools for open engineering" },
  "Updated": { es: "Actualizado", fr: "Mis à jour", de: "Aktualisiert", pt: "Atualizado", pcm: "Updated" },
  "Read more": { es: "Leer más", fr: "Lire la suite", de: "Weiterlesen", pt: "Ler mais", pcm: "Read more" },
  "All Rights Reserved": { es: "Todos los derechos reservados", fr: "Tous droits réservés", de: "Alle Rechte vorbehalten", pt: "Todos os direitos reservados", pcm: "All rights reserved" },
  "We want people to understand what we build, improve it and use that knowledge to build what comes next. Everything we ship is meant to be read, forked and argued with.": {
    es: "Queremos que las personas entiendan lo que construimos, lo mejoren y usen ese conocimiento para crear lo que sigue. Todo lo que publicamos se puede leer, bifurcar y cuestionar.",
    fr: "Nous voulons que chacun comprenne ce que nous construisons, l’améliore et utilise ces connaissances pour créer la suite. Tout ce que nous publions est fait pour être lu, forké et débattu.",
    de: "Wir möchten, dass Menschen verstehen, was wir bauen, es verbessern und dieses Wissen für die nächsten Entwicklungen nutzen. Alles, was wir veröffentlichen, soll gelesen, geforkt und diskutiert werden.",
    pt: "Queremos que as pessoas compreendam o que construímos, melhorem e usem esse conhecimento para criar o que vem a seguir. Tudo o que lançamos pode ser lido, bifurcado e debatido.",
    pcm: "We want people to understand wetin we build, improve am, and use the knowledge build wetin come next. Everything we ship make people read am, fork am and discuss am.",
  },
  "What you can show beats what you can do — so people without the right school never get the first look.": { es: "Lo que puedes demostrar pesa más que lo que sabes hacer; sin la escuela adecuada, muchos ni siquiera tienen una primera oportunidad.", fr: "Ce que l’on peut montrer compte plus que ce que l’on sait faire : sans la bonne école, beaucoup n’ont même pas leur première chance.", de: "Was du vorweisen kannst, zählt mehr als dein Können – ohne die richtige Schule bekommen viele nicht einmal die erste Chance.", pt: "O que se consegue mostrar vale mais do que aquilo que se sabe fazer — sem a escola certa, muitos nem têm uma primeira oportunidade.", pcm: "Wetin you fit show pass wetin you fit do — without correct school, some people no even get first chance." },
  "The stack that teaches you fastest is priced like the job you're trying to get.": { es: "Las herramientas que más rápido te enseñan cuestan tanto como el trabajo al que aspiras.", fr: "Les outils qui vous apprennent le plus vite coûtent aussi cher que le métier que vous visez.", de: "Die Tools, mit denen du am schnellsten lernst, kosten so viel wie der Job, den du anstrebst.", pt: "As ferramentas que ensinam mais depressa custam tanto como o emprego que procura.", pcm: "The tools wey fit teach you fast cost as much as the job wey you dey try get." },
  "Learn to use it, never to understand it. The machinery stays behind glass, and so does the knowledge.": { es: "Aprende a usarlo, nunca a entenderlo. La maquinaria queda tras el cristal, y también el conocimiento.", fr: "Apprenez à l’utiliser, jamais à le comprendre. La machine reste derrière une vitre, tout comme le savoir.", de: "Lerne, es zu bedienen, aber nicht zu verstehen. Die Technik bleibt hinter Glas – und das Wissen auch.", pt: "Aprenda a usar, nunca a compreender. A máquina fica atrás do vidro, assim como o conhecimento.", pcm: "Dem teach you how to use am, no be how to understand am. The machine stay behind glass, and the knowledge too." },
  "A path into engineering needs somewhere real to start — a first shipped thing, not another tutorial.": { es: "Un camino hacia la ingeniería necesita un punto de partida real: un primer proyecto publicado, no otro tutorial.", fr: "Pour entrer dans l’ingénierie, il faut un vrai point de départ : un premier projet livré, pas un tutoriel de plus.", de: "Der Einstieg in die Technik braucht einen echten Anfang – ein erstes veröffentlichtes Projekt statt noch eines Tutorials.", pt: "Um caminho para a engenharia precisa de um começo real — um primeiro projeto lançado, não mais um tutorial.", pcm: "Road enter engineering need real place to start — first thing wey you ship, no be another tutorial." },
  "The free tier, catalogued.": { es: "El nivel gratuito, catalogado.", fr: "Les offres gratuites, répertoriées.", de: "Der Free-Tier-Katalog.", pt: "Os planos gratuitos, catalogados.", pcm: "Free tier, arranged." },
  "A working reference to the services that give engineers a real free tier — what each one provides, and the limit worth knowing before you depend on it. Written as short articles; drawn from free-for.dev and checked on 16 November 2026.": {
    es: "Una guía práctica de servicios con un nivel gratuito útil para ingeniería: qué ofrece cada uno y qué límite conviene conocer antes de depender de él. Basada en free-for.dev y revisada el 16 de noviembre de 2026.",
    fr: "Un guide pratique des services proposant une vraie offre gratuite aux ingénieurs : ce qu’elle comprend et les limites à connaître avant de s’y fier. Rédigé à partir de free-for.dev et vérifié le 16 novembre 2026.",
    de: "Ein praktischer Überblick über Dienste mit einem echten kostenlosen Tarif für Engineering: Leistungen und wichtige Grenzen. Aus free-for.dev zusammengestellt und am 16. November 2026 geprüft.",
    pt: "Um guia prático dos serviços com um plano gratuito útil para engenharia: o que cada um oferece e que limites conhecer antes de depender dele. Baseado no free-for.dev e verificado em 16 de novembro de 2026.",
    pcm: "One useful guide to services wey give engineers real free tier — wetin each one offer and the limit to know before you depend on am. From free-for.dev, checked 16 November 2026.",
  },
  "Reference": { es: "Referencia", fr: "Référence", de: "Referenz", pt: "Referência", pcm: "Reference" },
  "Checked 16 November 2026": { es: "Revisado el 16 de noviembre de 2026", fr: "Vérifié le 16 novembre 2026", de: "Geprüft am 16. November 2026", pt: "Verificado em 16 de novembro de 2026", pcm: "Checked 16 November 2026" },
  "Explore the reference": { es: "Explorar la guía", fr: "Explorer le guide", de: "Referenz ansehen", pt: "Explorar a referência", pcm: "Explore the reference" },
  "Contents": { es: "Contenido", fr: "Sommaire", de: "Inhalt", pt: "Conteúdo", pcm: "Contents" },
  "Source:": { es: "Fuente:", fr: "Source :", de: "Quelle:", pt: "Fonte:", pcm: "Source:" },
  "Skip to content": { es: "Saltar al contenido", fr: "Aller au contenu", de: "Zum Inhalt springen", pt: "Saltar para o conteúdo", pcm: "Skip go content" },
  "Work with us, or join us.": { es: "Trabaja con nosotros o únete al equipo.", fr: "Travaillons ensemble ou rejoignez-nous.", de: "Arbeite mit uns oder mach mit.", pt: "Trabalhe connosco ou junte-se a nós.", pcm: "Work with us or join us." },
  "What are you working on?": { es: "¿En qué estás trabajando?", fr: "Sur quoi travaillez-vous ?", de: "Woran arbeitest du?", pt: "Em que está a trabalhar?", pcm: "Wetin you dey work on?" },
  "Send a note": { es: "Enviar mensaje", fr: "Envoyer un message", de: "Nachricht senden", pt: "Enviar mensagem", pcm: "Send message" },
  "Sherwood": { es: "Sherwood", fr: "Sherwood", de: "Sherwood", pt: "Sherwood", pcm: "Sherwood" },
  "Buy a floor under a stock token, keep every gain above it, and settle against prices read from the chain. If the price never falls through, you simply keep your upside.": {
    es: "Establece un mínimo para un token de acciones, conserva las ganancias por encima y liquida según los precios registrados en la cadena. Si el precio nunca cae por debajo, conservas toda la subida.",
    fr: "Fixez un plancher pour un jeton d’action, gardez les gains au-dessus et réglez selon les prix lus sur la chaîne. Si le prix ne passe jamais sous ce seuil, vous conservez toute la hausse.",
    de: "Lege einen Mindestwert für einen Aktien-Token fest, behalte alle Gewinne darüber und rechne anhand der On-Chain-Preise ab. Fällt der Preis nie darunter, bleibt dein gesamter Gewinn erhalten.",
    pt: "Defina um limite mínimo para um token de ações, mantenha os ganhos acima dele e liquide com base nos preços registados na cadeia. Se o preço nunca cair abaixo, conserva toda a valorização.",
    pcm: "Set floor for stock token, keep every gain above am, and settle with prices wey chain read. If price no fall pass the floor, you keep all your upside.",
  },
  "Send and receive Zcash by a name instead of an address, with payment requests that only the two people involved can read — including from the app's own server.": {
    es: "Envía y recibe Zcash usando un nombre en vez de una dirección, con solicitudes de pago que solo pueden leer las dos personas implicadas, incluso desde el servidor de la aplicación.",
    fr: "Envoyez et recevez du Zcash avec un nom plutôt qu’une adresse. Seules les deux personnes concernées peuvent lire les demandes de paiement, même depuis le serveur de l’application.",
    de: "Sende und empfange Zcash über einen Namen statt einer Adresse. Zahlungsanfragen sind nur für die beiden Beteiligten lesbar – selbst für den Server der App.",
    pt: "Envie e receba Zcash usando um nome em vez de um endereço. Só as duas pessoas envolvidas conseguem ler os pedidos de pagamento, até mesmo a partir do servidor da aplicação.",
    pcm: "Send and receive Zcash with name instead of address. Only the two people involved fit read payment request, even from the app server.",
  },
  "Condition is parametric insurance on Midnight. Policy terms and trigger events live on the public ledger. Who claimed — and the proof that their settlement was fair — never does.": {
    es: "Condition ofrece seguros paramétricos en Midnight. Las condiciones de la póliza y los eventos que la activan viven en el registro público. Quién reclamó y la prueba de que el pago fue justo permanecen privados.",
    fr: "Condition propose une assurance paramétrique sur Midnight. Les conditions et les événements déclencheurs figurent sur le registre public. L’identité des demandeurs et la preuve d’un règlement équitable restent privées.",
    de: "Condition ist eine parametrische Versicherung auf Midnight. Vertragsbedingungen und Auslöser stehen im öffentlichen Ledger. Wer einen Anspruch stellt und der Nachweis einer fairen Auszahlung bleiben privat.",
    pt: "Condition é um seguro paramétrico na Midnight. Os termos da apólice e os eventos acionadores ficam no registo público. Quem fez o pedido e a prova de que a liquidação foi justa permanecem privados.",
    pcm: "Condition na parametric insurance for Midnight. Policy terms and trigger events dey on public ledger. Who claim and proof say settlement fair no dey public.",
  },
  "Exetazo reads the terms of service for you, then shows the clauses that could cost you money, your data, or your right to sue. Every flag comes with the exact sentence it came from — so you can check it yourself.": {
    es: "Exetazo lee las condiciones del servicio y señala las cláusulas que podrían costarte dinero, tus datos o el derecho a demandar. Cada alerta incluye la frase exacta para que puedas comprobarla.",
    fr: "Exetazo lit les conditions d’utilisation et repère les clauses qui peuvent coûter de l’argent, des données ou le droit d’agir en justice. Chaque alerte cite la phrase exacte pour vérification.",
    de: "Exetazo liest Nutzungsbedingungen und markiert Klauseln, die Geld, Daten oder das Recht auf Klage kosten können. Jeder Hinweis enthält den genauen Satz zum Nachprüfen.",
    pt: "Exetazo lê os termos de serviço e destaca cláusulas que podem custar dinheiro, dados ou o direito de processar. Cada alerta inclui a frase exata para que possa confirmar.",
    pcm: "Exetazo read service terms for you and show clauses wey fit cost money, data, or your right to sue. Every warning show the exact sentence make you check am yourself.",
  },
  "A succession layer for tokenized real-world assets — because a contract outlives its account holder.": {
    es: "Una capa de sucesión para activos del mundo real tokenizados, porque un contrato sobrevive a quien posee la cuenta.",
    fr: "Une couche de succession pour les actifs réels tokenisés, car un contrat peut survivre à son titulaire.",
    de: "Eine Nachfolgeschicht für tokenisierte reale Vermögenswerte – denn ein Vertrag überdauert seinen Kontoinhaber.",
    pt: "Uma camada sucessória para ativos do mundo real tokenizados — porque um contrato sobrevive ao titular da conta.",
    pcm: "Succession layer for tokenized real-world assets — contract fit live pass the account owner.",
  },
  "Haqi investigates live air-quality data across scattered sources and answers with a one-glance verdict a 14-year-old understands, plus the weighted evidence chain behind it, every receipt logged.": {
    es: "Haqi analiza datos de calidad del aire en tiempo real de distintas fuentes y ofrece un veredicto claro que entiende alguien de 14 años, junto con la evidencia ponderada y cada dato registrado.",
    fr: "Haqi analyse des données de qualité de l’air en direct provenant de sources dispersées et donne un verdict compréhensible au premier regard, même à 14 ans, avec les preuves pondérées et chaque source enregistrée.",
    de: "Haqi untersucht aktuelle Luftqualitätsdaten aus verschiedenen Quellen und liefert ein klares Urteil, das auch 14-Jährige verstehen, samt gewichteter Beweiskette und protokollierten Belegen.",
    pt: "Haqi analisa dados de qualidade do ar em tempo real de várias fontes e apresenta um veredicto claro que alguém de 14 anos compreende, com a cadeia de evidências ponderada e cada registo guardado.",
    pcm: "Haqi check live air-quality data from different places and give clear answer wey 14-year-old fit understand, with weighted evidence and every receipt logged.",
  },
  "Your name": { es: "Tu nombre", fr: "Votre nom", de: "Dein Name", pt: "O seu nome", pcm: "Your name" },
  "Email placeholder": { es: "tu@ejemplo.com", fr: "vous@exemple.com", de: "du@beispiel.de", pt: "voce@exemplo.com", pcm: "you@example.com" },
  "You": { es: "Tú", fr: "Vous", de: "Du", pt: "Você", pcm: "You" },
  "Live products from Baseline — designed, engineered and shipped in the open. Every project here is open to contributors who want a real thing to work on.": {
    es: "Productos de Baseline en directo, diseñados, desarrollados y publicados abiertamente. Cada proyecto está abierto a quienes quieran trabajar en algo real.",
    fr: "Des produits Baseline en ligne, conçus, développés et publiés au grand jour. Chaque projet est ouvert aux personnes qui veulent travailler sur du concret.",
    de: "Live-Produkte von Baseline, offen gestaltet, entwickelt und veröffentlicht. Jedes Projekt steht allen offen, die an etwas Echtem mitarbeiten möchten.",
    pt: "Produtos da Baseline no ar, concebidos, desenvolvidos e lançados abertamente. Todos os projetos estão abertos a quem queira trabalhar em algo real.",
    pcm: "Baseline products wey dey live, designed, built and shipped open. Every project dey open to people wey wan work on real thing.",
  },
  "Solidity contracts + a React app": { es: "Contratos Solidity + una app React", fr: "Contrats Solidity + une application React", de: "Solidity-Verträge + eine React-App", pt: "Contratos Solidity + uma aplicação React", pcm: "Solidity contracts + React app" },
  "Foundry, Chainlink, USDG": { es: "Foundry, Chainlink, USDG", fr: "Foundry, Chainlink, USDG", de: "Foundry, Chainlink, USDG", pt: "Foundry, Chainlink, USDG", pcm: "Foundry, Chainlink, USDG" },
  "Robinhood Chain testnet, 46630": { es: "Red de pruebas Robinhood Chain, 46630", fr: "Testnet Robinhood Chain, 46630", de: "Robinhood-Chain-Testnet, 46630", pt: "Testnet Robinhood Chain, 46630", pcm: "Robinhood Chain testnet, 46630" },
  "Live on testnet · unaudited": { es: "Activo en testnet · sin auditoría", fr: "En ligne sur testnet · non audité", de: "Im Testnet live · nicht auditiert", pt: "Ativo na testnet · não auditado", pcm: "Live for testnet · never audited" },
  "Non-custodial web app": { es: "Aplicación web sin custodia", fr: "Application web non dépositaire", de: "Nicht-verwahrende Web-App", pt: "Aplicação web não custodial", pcm: "Non-custodial web app" },
  "React 19, Hono, Zcash (ZIP-316/321)": { es: "React 19, Hono, Zcash (ZIP-316/321)", fr: "React 19, Hono, Zcash (ZIP-316/321)", de: "React 19, Hono, Zcash (ZIP-316/321)", pt: "React 19, Hono, Zcash (ZIP-316/321)", pcm: "React 19, Hono, Zcash (ZIP-316/321)" },
  "ZECATHON 2026 · Shielded Payments": { es: "ZECATHON 2026 · Pagos protegidos", fr: "ZECATHON 2026 · Paiements protégés", de: "ZECATHON 2026 · Geschützte Zahlungen", pt: "ZECATHON 2026 · Pagamentos protegidos", pcm: "ZECATHON 2026 · Shielded payments" },
  "Live · verified on mainnet": { es: "Activo · verificado en mainnet", fr: "En ligne · vérifié sur mainnet", de: "Live · im Mainnet verifiziert", pt: "Ativo · verificado na mainnet", pcm: "Live · checked on mainnet" },
  "Parametric insurance": { es: "Seguro paramétrico", fr: "Assurance paramétrique", de: "Parametrische Versicherung", pt: "Seguro paramétrico", pcm: "Parametric insurance" },
  "Live on Midnight preprod": { es: "Activo en Midnight preprod", fr: "En ligne sur Midnight preprod", de: "Live auf Midnight Preprod", pt: "Ativo na Midnight preprod", pcm: "Live for Midnight preprod" },
  "Client-side zero-knowledge proofs": { es: "Pruebas de conocimiento cero en el cliente", fr: "Preuves à divulgation nulle de connaissance côté client", de: "Zero-Knowledge-Beweise auf dem Client", pt: "Provas de conhecimento zero no cliente", pcm: "Client-side zero-knowledge proofs" },
  "Private claims · public receipts": { es: "Reclamaciones privadas · recibos públicos", fr: "Réclamations privées · reçus publics", de: "Private Ansprüche · öffentliche Belege", pt: "Reclamações privadas · comprovativos públicos", pcm: "Private claims · public receipts" },
  "Terms of service analysis": { es: "Análisis de condiciones de servicio", fr: "Analyse des conditions d’utilisation", de: "Analyse der Nutzungsbedingungen", pt: "Análise dos termos de serviço", pcm: "Terms of service analysis" },
  "Risk clause detection": { es: "Detección de cláusulas de riesgo", fr: "Détection des clauses à risque", de: "Erkennung von Risikoklauseln", pt: "Deteção de cláusulas de risco", pcm: "Risk clause detection" },
  "Source-linked findings": { es: "Hallazgos con fuentes enlazadas", fr: "Résultats liés à leurs sources", de: "Quellenverknüpfte Ergebnisse", pt: "Resultados ligados às fontes", pcm: "Findings linked to source" },
  "Privacy · data · arbitration": { es: "Privacidad · datos · arbitraje", fr: "Vie privée · données · arbitrage", de: "Datenschutz · Daten · Schiedsverfahren", pt: "Privacidade · dados · arbitragem", pcm: "Privacy · data · arbitration" },
  "Tokenized real-world assets": { es: "Activos reales tokenizados", fr: "Actifs réels tokenisés", de: "Tokenisierte reale Vermögenswerte", pt: "Ativos reais tokenizados", pcm: "Tokenized real-world assets" },
  "Digital succession": { es: "Sucesión digital", fr: "Succession numérique", de: "Digitale Nachfolge", pt: "Sucessão digital", pcm: "Digital succession" },
  "Smart contract inheritance": { es: "Herencia mediante contratos inteligentes", fr: "Héritage par contrat intelligent", de: "Vererbung durch Smart Contracts", pt: "Herança por contrato inteligente", pcm: "Smart contract inheritance" },
  "Account continuity": { es: "Continuidad de la cuenta", fr: "Continuité du compte", de: "Kontokontinuität", pt: "Continuidade da conta", pcm: "Account continuity" },
  "Air-quality intelligence": { es: "Inteligencia sobre calidad del aire", fr: "Informations sur la qualité de l’air", de: "Luftqualitätsinformationen", pt: "Inteligência sobre qualidade do ar", pcm: "Air-quality intelligence" },
  "Live multi-source data": { es: "Datos en vivo de múltiples fuentes", fr: "Données en direct de plusieurs sources", de: "Live-Daten aus mehreren Quellen", pt: "Dados em tempo real de várias fontes", pcm: "Live data from different sources" },
  "Evidence-weighted answers": { es: "Respuestas ponderadas por evidencia", fr: "Réponses pondérées par les preuves", de: "Nach Evidenz gewichtete Antworten", pt: "Respostas ponderadas pelas evidências", pcm: "Answers weighted by evidence" },
  "Auditable receipts": { es: "Registros auditables", fr: "Reçus vérifiables", de: "Nachprüfbare Belege", pt: "Registos auditáveis", pcm: "Auditable receipts" },
  "Our work puts the": { es: "Nuestro trabajo prioriza a la", fr: "Notre travail donne la priorité à la", de: "Unsere Arbeit stellt die", pt: "O nosso trabalho põe a", pcm: "Our work put" },
  "first, while making room for experienced practitioners to collaborate, research and keep growing.": {
    es: "en primer lugar, y también permite que profesionales con experiencia colaboren, investiguen y sigan creciendo.",
    fr: "en premier, tout en permettant aux professionnels expérimentés de collaborer, de mener des recherches et de continuer à progresser.",
    de: "in den Mittelpunkt und schafft zugleich Raum für erfahrene Praktiker, um zusammenzuarbeiten, zu forschen und sich weiterzuentwickeln.",
    pt: "em primeiro lugar, criando também espaço para profissionais experientes colaborarem, pesquisarem e continuarem a crescer.",
    pcm: "first, while experienced people still get room to work together, research and grow.",
  },
};

type I18nContextValue = { language: Language; setLanguage: (language: Language) => void; t: (english: string) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "es" || value === "fr" || value === "de" || value === "pt" || value === "pcm";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = window.localStorage.getItem("baseline-language");
      return isLanguage(saved) ? saved : "en";
    } catch {
      return "en";
    }
  });

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    try {
      window.localStorage.setItem("baseline-language", nextLanguage);
    } catch {
      // Language switching still works for this session if storage is unavailable.
    }
  }

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: (english) => translations[english]?.[language] ?? english,
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
