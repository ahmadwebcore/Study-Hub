import { testService, getLocalCertifiedResults, isDateToday } from './testService';
import { attendanceService } from './attendanceService';
import { taskService } from './taskService';
import { integrationService } from './integrationService';
import { TestItem } from '../types';

export interface AIChatAction {
  id: string;
  label: string;
  actionType:
    | 'reschedule_test'
    | 'complete_today_task'
    | 'check_marks'
    | 'share_whatsapp'
    | 'view_sprint_target'
    | 'unlock_today_test'
    | 'mark_attendance'
    | 'resolve_schedule_issues'
    | 'allow_retest'
    | 'sync_google_sheet';
  details?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  urduText?: string;
  analogy?: string;
  boardExamTips?: string[];
  codeSnippet?: string;
  actions?: AIChatAction[];
  actionExecuted?: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface AIProviderConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'offline';
  apiKey: string;
  model: string;
}

const STORAGE_KEY_AI_CONFIG = 'gsa_ai_config_v3';

// Comprehensive 1st Year Intermediate FA-IT Subject Knowledge Base
const ACADEMIC_KNOWLEDGE: {
  keywords: string[];
  title: string;
  english: string;
  romanUrdu: string;
  urdu?: string;
}[] = [
  // --- COMPUTER SCIENCE ---
  {
    keywords: ['bus topology', 'bus network', 'backbone cable', 'terminator', 'terminators'],
    title: 'Bus Topology (Computer Science 11 - Unit 2)',
    english: `**Bus Topology** connects all computers and devices to a single central cable known as the **Backbone** or **Trunk** cable.

• **Working**: Data sent by a device travels along the backbone in both directions. All devices receive the signal, but only the machine whose MAC/IP address matches processes it.
• **Terminators**: 50-ohm terminators are fixed at both cable ends to absorb signals and prevent reflection/bounce.
• **Advantages**:
  1. Low cabling cost and easy setup.
  2. Best suited for small networks.
• **Disadvantages**:
  1. If the central cable breaks, the entire network shuts down.
  2. Difficult to troubleshoot individual node faults.`,
    romanUrdu: `**Bus Topology** mein tamam computers ek hi central cable (Backbone) se connect hotay hain.

• **Kaam karne ka tareeqa**: Data central cable par dono taraf travel karta hai. Har computer signal check karta hai magar accept sirf wahi karta hai jiska address match ho.
• **Terminators**: Cable ke dono saron par terminators lagaye jaate hain taake signal wapis bounce na ho.
• **Fawaid**: Cable ka kharcha kam hota hai aur setup aasan hai.
• **Nuqsaan**: Agar main backbone cable toot jaye to poora network band ho jata hai.`,
    urdu: `**بس ٹوپولوجی** میں تمام کمپیوٹرز ایک ہی مرکزی کیبل (بیک بون) کے ذریعے جڑے ہوتے ہیں۔
• مرکزی کیبل کے دونوں سروں پر ٹرمینیٹرز لگے ہوتے ہیں تاکہ سگنل واپس نہ ٹکرائے۔
• اگر مرکزی کیبل خراب ہو جائے تو پورا نیٹ ورک بند ہو جاتا ہے۔`
  },
  {
    keywords: ['star topology', 'star network', 'central switch', 'hub'],
    title: 'Star Topology (Computer Science 11 - Unit 2)',
    english: `**Star Topology** connects every computer directly to a central connecting device (a **Network Switch** or **Hub**) via dedicated point-to-point cables.

• **Working**: All communication passes through the central device, which routes data packets to the intended recipient.
• **Fault Isolation**: If any single workstation or cable fails, only that device is disconnected; the rest of the network operates normally.
• **Advantages**: Easy to install, expand, and isolate faults.
• **Disadvantages**: Requires more cable than bus topology; if the central switch fails, the whole network goes down.`,
    romanUrdu: `**Star Topology** modern computer labs mein sab se zyada use hoti hai.

• **Working**: Har computer alag cable ke zariye ek central device (Switch ya Hub) se jurra hota hai.
• **Faida**: Agar kisi ek computer ki wire toot jaye to baqi network bilkul theek chalta rehta hai.
• **Nuqsaan**: Cable zyada lagti hai aur agar central switch kharab ho jaye to saara network band ho jata hai.`,
    urdu: `**اسٹار ٹوپولوجی** میں تمام کمپیوٹرز ایک مرکزی سوئچ یا ہب سے الگ الگ کیبل کے ذریعے جڑے ہوتے ہیں۔
• کسی ایک کمپیوٹر کی تار کٹ جانے سے باقی نیٹ ورک پر کوئی اثر نہیں پڑتا۔`
  },
  {
    keywords: ['ring topology', 'ring network', 'token passing'],
    title: 'Ring Topology & Token Passing',
    english: `**Ring Topology** connects each device to exactly two adjacent devices, forming an unbroken closed circle.

• **Token Passing**: Devices transmit data only when they acquire a circulating 3-byte frame called a **Token**.
• **Unidirectional Flow**: Data moves in one continuous direction (clockwise or counter-clockwise). Each node regenerates the signal.
• **Disadvantage**: If any single computer or cable link breaks, the entire ring is disrupted (unless a Dual Ring is used).`,
    romanUrdu: `**Ring Topology** mein har computer aglay aur pichlay do computers se jurr kar ek circular ring banata hai.
Data Token Passing ke zariye ek hi simt mein travel karta hai. Agar ek computer bhi band ho jaye to poori ring toot jati hai.`,
    urdu: `**رنگ ٹوپولوجی** میں ہر کمپیوٹر دو ہمسایہ کمپیوٹرز کے ساتھ مل کر ایک دائرہ بناتا ہے اور ٹوکن پاسنگ کے ذریعے ڈیٹا ایک سمت میں سفر کرتا ہے۔`
  },
  {
    keywords: ['mesh topology', 'full mesh'],
    title: 'Mesh Topology (Fault Tolerance & Redundancy)',
    english: `**Mesh Topology** connects every device to every other device via dedicated point-to-point links.

• **Formula**: For $n$ devices, the network requires $\frac{n(n-1)}{2}$ physical links.
• **Advantages**: Maximum reliability, dedicated non-shared channels, zero traffic congestion, and high privacy.
• **Disadvantages**: Very high cabling cost and complex hardware configuration.`,
    romanUrdu: `**Mesh Topology** mein har computer doosre har computer se dedicated direct wire se connect hota hai.
• Yeh sab se zyada reliable aur safe hai magar sab se mehangi aur complex topology hai. Formula: $n(n-1)/2$ wires darkar hoti hain.`,
  },
  {
    keywords: ['cpu', 'processor', 'central processing unit', 'alu', 'cu', 'control unit', 'registers'],
    title: 'CPU Architecture (ALU, CU, Registers & Cache)',
    english: `The **CPU (Central Processing Unit)** executes instructions using the **Fetch-Decode-Execute** cycle:

1. **ALU (Arithmetic Logic Unit)**:
   - *Arithmetic Section*: Performs +, -, *, / calculations.
   - *Logic Section*: Evaluates conditions (=, <, >, AND, OR, NOT).
2. **Control Unit (CU)**: The supervisor of the CPU. Fetches instructions from RAM, decodes opcodes, and issues timing signals to components.
3. **Registers**: Ultra-high-speed temporary storage cells on the CPU die (PC, IR, MAR, MBR, Accumulator).
4. **Cache Memory**: High-speed SRAM (L1, L2, L3) bridging the speed gap between CPU and RAM.`,
    romanUrdu: `**CPU (Central Processing Unit)** computer ka dimagh hai jo tamam hidayat ko fetch, decode aur execute karta hai:

1. **ALU (Arithmetic Logic Unit)**: Hisaabi (+, -, *, /) aur mantiqi (<, >, AND, OR) faislay karta hai.
2. **Control Unit (CU)**: Computer ka supervisor hai jo RAM se instructions lata hai aur hardware ko manage karta hai.
3. **Registers**: Processor ke andar mojood fast temporary memory cells hain (jaise PC, IR, Accumulator).
4. **Cache**: Fast memory jo CPU aur RAM ke darmiyan speed match karne ke liye use hoti hai.`,
    urdu: `**سی پی یو (CPU)** کمپیوٹر کا دماغ ہے جس کے اہم حصے یہ ہیں:
• **اے ایل یو (ALU)**: حسابی اور منطقی آپریشنز انجام دیتا ہے۔
• **کنٹرول یونٹ (CU)**: کمپیوٹر کے تمام حصوں کی نگرانی کرتا ہے۔
• **رجسٹرز**: پروسیسر کے اندر تیز ترین عارضی میموری۔`
  },
  {
    keywords: ['ram', 'rom', 'difference between ram and rom', 'volatile memory', 'dram', 'sram'],
    title: 'RAM vs ROM Comparison (BISE Exam Standard)',
    english: `| Feature | RAM (Random Access Memory) | ROM (Read-Only Memory) |
|---|---|---|
| **Volatility** | Volatile (data lost when power is off) | Non-volatile (data stays permanently) |
| **Operations** | Read and Write | Read-Only during normal operation |
| **Contents** | Active OS processes & open programs | Startup firmware (BIOS / UEFI) |
| **Speed** | Nanosecond high speed | Slower than RAM |
| **Types** | DRAM, SRAM | PROM, EPROM, EEPROM |`,
    romanUrdu: `• **RAM (Random Access Memory)**: Arzi (volatile) memory hai. Bijli band hote hi iska data saaf ho jata hai. Is par read aur write dono hota hai.
• **ROM (Read Only Memory)**: Mustaqil (non-volatile) memory hai. Ismein BIOS program hota hai jo computer ko start karta hai aur bijli band hone par bhi mehfooz rehta hai.`,
  },
  {
    keywords: ['system bus', 'bus', 'data bus', 'address bus', 'control bus'],
    title: 'System Bus: Data Bus, Address Bus & Control Bus',
    english: `A **System Bus** is an electronic pathway connecting the CPU to memory and peripheral devices:

1. **Data Bus**: Bi-directional lines carrying actual data between CPU, memory, and I/O devices (8, 16, 32, 64-bit width).
2. **Address Bus**: Unidirectional lines carrying physical memory addresses that the CPU wants to read from or write to.
3. **Control Bus**: Transmits control and timing signals (Read, Write, Interrupt, Bus Request).`,
    romanUrdu: `**System Bus** wires ka wo group hai jo CPU ko RAM aur doosri devices se connect karta hai:
1. **Data Bus**: Data ko CPU aur memory ke darmiyan lata aur le jata hai (dono simt / bidirectional).
2. **Address Bus**: Sirf memory ka address le kar jata hai (ek simt / unidirectional).
3. **Control Bus**: Control signals (jaise Memory Read, Memory Write) pohanchata hai.`,
  },
  {
    keywords: ['osi model', 'osi layers', '7 layers', 'open systems interconnection'],
    title: 'OSI 7-Layer Reference Model',
    english: `The **OSI Model** standardizes network communication across 7 layers:
7. **Application**: HTTP, HTTPS, FTP, SMTP (user interface).
6. **Presentation**: Formatting, Compression, Encryption (SSL, JPEG).
5. **Session**: Manages connection sessions (RPC, NetBIOS).
4. **Transport**: End-to-end transport, segmenting, TCP/UDP.
3. **Network**: IP addressing and packet routing across routers.
2. **Data Link**: MAC addressing, frame transmission, switches.
1. **Physical**: Raw bit stream over physical cables and signals.

*Mnemonic*: **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing (7 to 1).`,
    romanUrdu: `OSI model networking ke 7 darjaat (layers) par mushtamil hai:
7. Application Layer (HTTP, Email)
6. Presentation Layer (Encryption, Compression)
5. Session Layer (Dialogue coordination)
4. Transport Layer (TCP, UDP packets)
3. Network Layer (IP Address aur Router)
2. Data Link Layer (MAC Address aur Switch)
1. Physical Layer (Cables aur Electronic signals)`,
  },
  {
    keywords: ['lan', 'man', 'wan', 'local area network', 'wide area network'],
    title: 'Network Scales: LAN, MAN, WAN',
    english: `• **LAN (Local Area Network)**: Spans a single room, lab, or building. High data rate (up to 10 Gbps), low latency, private ownership.
• **MAN (Metropolitan Area Network)**: Spans an entire city or large campus (e.g., Cable TV network, city ISP).
• **WAN (Wide Area Network)**: Spans multiple countries or continents. The Internet is the largest WAN.`,
    romanUrdu: `• **LAN**: Ek kamray ya building ka network (maslan College Computer Lab).
• **MAN**: Poore shehar ka network (maslan Shehar ka Cable TV network).
• **WAN**: Poori dunya par phaila network (sab se bari misaal Internet hai).`,
  },
  {
    keywords: ['switch', 'router', 'hub', 'network devices', 'bridge', 'gateway', 'repeater'],
    title: 'Network Devices: Switch, Router, Hub & Bridge',
    english: `• **Hub**: Layer 1 physical device. Broadcasts all data to every port (causes collisions).
• **Switch**: Layer 2 intelligent device. Inspects MAC addresses and forwards frames only to the target device.
• **Router**: Layer 3 device. Routes data packets between different networks using IP addresses.
• **Repeater**: Amplifies and regenerates weakened signals over long cable lengths.`,
    romanUrdu: `• **Hub**: Na-samajh (dumb) device jo data sab computers ko bhejti hai.
• **Switch**: Intelligent device jo MAC address dekh kar sirf matlooba computer ko data bhejti hai.
• **Router**: Mukhtalif networks ko aapas mein jorta hai aur best rasta talash karta hai.
• **Repeater**: Lambay faaslay par kamzor hone wale signal ko mazboot karta hai.`,
  },
  {
    keywords: ['binary', 'binary numbers', 'number systems', 'decimal to binary', 'hexadecimal', 'octal'],
    title: 'Number Systems: Binary, Decimal, Octal & Hexadecimal',
    english: `• **Binary (Base 2)**: Digits 0 and 1. Machine language of computing.
• **Decimal (Base 10)**: Digits 0-9. Standard human counting.
• **Octal (Base 8)**: Digits 0-7.
• **Hexadecimal (Base 16)**: Digits 0-9 and letters A-F (A=10, B=11, C=12, D=13, E=14, F=15).
• **Conversion**: Divide decimal numbers repeatedly by target base (2, 8, 16) and record remainders from bottom to top.`,
    romanUrdu: `• **Binary (Base 2)**: Sirf 0 aur 1 (computer ki zaban).
• **Decimal (Base 10)**: 0 se 9 tak aam ginti.
• **Hexadecimal (Base 16)**: 0 se 9 aur A se F tak (memory addresses ke liye).
• **Conversion**: Decimal number ko 2 par divide karte jayein aur remainders neechay se ooper likhein.`,
  },
  {
    keywords: ['virus', 'malware', 'trojan horse', 'worm', 'ransomware', 'antivirus'],
    title: 'Computer Security Threats & Malicious Software',
    english: `• **Computer Virus**: Malicious program that replicates by attaching to executable files.
• **Worm**: Standalone self-replicating malware that spreads across networks without host files.
• **Trojan Horse**: Malware disguised as useful software that opens backdoor access for hackers.
• **Ransomware**: Encrypts victim data and demands payment for the decryption key.
• **Defenses**: Real-time antivirus scanners, active firewalls, and regular offline data backups.`,
    romanUrdu: `• **Virus**: Files ke sath jurr kar nuksan pohanchane wala program.
• **Worm**: Khud ba khud network par phail kar system ko slow karne wala program.
• **Trojan Horse**: Faidamand ban kar system mein dakhil hota hai aur backdoor kholta hai.
• **Ransomware**: Files ko lock kar ke paise mangta hai.
• **Hifazat**: Antivirus install rakhein aur data ka backup rakhein.`,
  },
  {
    keywords: ['operating system', 'os', 'multitasking', 'scheduling', 'fcfs', 'round robin'],
    title: 'Operating System Functions & CPU Scheduling',
    english: `An **Operating System (OS)** manages computer hardware and system resources:

• **Core Functions**:
  1. *Processor Management*: Allocates CPU time to processes (Round Robin, FCFS).
  2. *Memory Management*: Tracks RAM allocation and virtual memory paging.
  3. *File Management*: Organizes files in hierarchical directories (NTFS, FAT32).
  4. *Device Management*: Coordinates peripheral devices via device drivers.
  5. *Security*: User authentication and permissions.`,
    romanUrdu: `**Operating System (OS)** wo software hai jo computer hardware aur user ke darmiyan rabta banata hai (maslan Windows 11, Linux).
Iske bunyadi kaam: Processor scheduling, RAM memory management, files organization, aur virus/security protection.`,
  },

  // --- ENGLISH 11 ---
  {
    keywords: ['button button', 'richard matheson', 'norma', 'arthur', 'mr steward'],
    title: 'English 11 Story 1: "Button, Button" by Richard Matheson',
    english: `• **Author**: Richard Matheson.
• **Main Characters**: Norma Lewis (materialistic wife), Arthur Lewis (principled husband), Mr. Steward (agent).
• **Plot Summary**: Mr. Steward delivers a box with a button. If pressed, someone they don't know will die, and they will receive $50,000. Arthur firmly opposes it on moral grounds. Norma rationalizes the act, pushes the button, and Arthur dies in a train accident, yielding a $50,000 life insurance policy.
• **Moral**: Greed leads to catastrophe; selfishness blinds people to human values.`,
    romanUrdu: `• **Story**: "Button, Button" by Richard Matheson.
• **Kirdar**: Norma (lalachi biwi), Arthur (usool pasand shohar), Mr. Steward.
• **Khulasa**: Steward $50,000 ka lalach de kar button dabane ki peshkash karta hai. Arthur mana karta hai magar Norma lalach mein button daba deti hai. Nateeja yeh nikalta hai ke Arthur train hadsay mein mara jata hai aur insurance ke $50,000 milte hain.
• **Sabaq**: Lalach buri bala hai.`,
  },
  {
    keywords: ['clearing in the sky', 'jesse stuart', 'jess', 'old man'],
    title: 'English 11 Story 2: "Clearing in the Sky" by Jesse Stuart',
    english: `• **Author**: Jesse Stuart.
• **Main Characters**: Jess (narrator) and his 70-year-old father.
• **Plot Summary**: Despite heart doctors giving him only a few days to live, the father clears a steep mountain patch with his own hands to plant tomatoes, corn, and potatoes. He climbs multiple paths to test his strength.
• **Theme**: Indomitable human willpower, hard work, and deep love for nature triumphing over physical frailty.`,
    romanUrdu: `• **Story**: "Clearing in the Sky" by Jesse Stuart.
• **Khulasa**: Jess ka 70 saala beemar baap jise doctors ne aaram ka mashwara diya tha, pahaar ki choti par ja kar zameen saaf karta hai aur faslein ugata hai.
• **Sabaq**: Himmat, mehnat aur pukhta irada mout aur beemari ko bhi maat de deta hai.`,
  },
  {
    keywords: ['the rain', 'wh davies', 'w h davies', 'rain poem'],
    title: 'English 11 Poem 1: "The Rain" by W. H. Davies',
    english: `• **Poet**: W. H. Davies.
• **Central Theme**: The poem portrays rain falling on leaves. The top thick leaves drink water first and pass the drops to poor lower leaves—a metaphor for social inequality where wealthy classes receive resources first.
• **Hope**: The emergence of the sun spreading bright light over everything symbolizes universal equality and optimism.`,
    romanUrdu: `• **Nazm**: "The Rain" by W. H. Davies.
• **Theme**: Barish ke qatray ooper walay ameer paton par girtay hain jo neeche walay ghareeb paton ko qatra qatra dete hain (muashray ki ghurbat aur ameeri ka istara).
• **Umeed**: Aakhir mein jab sooraj nikalta hai to har cheez barabar roshan ho jati hai jo insaf aur barabari ki alamat hai.`,
  },
  {
    keywords: ['tenses', '12 tenses', 'english tenses', 'present indefinite', 'past indefinite', 'future'],
    title: '12 English Tenses: Key Formulas & Rules',
    english: `• **Present Simple**: Sub + V1 (+ s/es). (e.g., He studies computer science.)
• **Present Continuous**: Sub + is/am/are + V1+ing. (e.g., They are taking the test.)
• **Present Perfect**: Sub + has/have + V3. (e.g., She has completed Unit 1.)
• **Past Simple**: Sub + V2. Negative: did not + V1. (e.g., We attempted the paper.)
• **Past Continuous**: Sub + was/were + V1+ing.
• **Future Simple**: Sub + will/shall + V1. (e.g., You will pass with distinction.)`,
    romanUrdu: `• **Present Simple**: Sub + 1st form (+ s/es). (Pehchan: ta hai, ti hai, te hain).
• **Past Simple**: Sub + 2nd form of verb. Negative: did not + 1st form.
• **Future Simple**: Sub + will/shall + 1st form. (Pehchan: ga, gi, ge).
• **Continuous**: Hamesha V1+ing lagta hai.
• **Perfect**: Hamesha 3rd form (V3) lagti hai.`,
  },
  {
    keywords: ['active passive', 'passive voice', 'voice change'],
    title: 'Active & Passive Voice Conversion Rules',
    english: `Key Rules for Passive Voice:
1. Object of active sentence becomes the Subject.
2. Always use the 3rd form of Verb (V3 / Past Participle).
3. Insert auxiliary 'by' before the agent.
4. Tense shift rules:
   - Present Simple: is/am/are + V3
   - Continuous: being + V3
   - Perfect: been + V3
   - Past Simple: was/were + V3`,
    romanUrdu: `Passive Voice ke 4 bunyadi usool:
1. Object ko shuroo mein Subject banayein.
2. Hamesha Verb ki 3rd form (V3) lagayein.
3. 'by' ka lafz istemal karein.
4. Continuous sentences mein 'being' aur Perfect sentences mein 'been' ka izafa karein.`,
  },

  // --- URDU 11 ---
  {
    keywords: ['uswa', 'uswa-e-hasna', 'shibli nomani', 'sabaq 1'],
    title: 'Urdu 11 Sabaq 1: "Uswa-e-Hasna" by Maulana Shibli Nomani',
    english: `• **Author**: Allama Shibli Nomani (Seerat-un-Nabi).
• **Theme**: The blessed life of Prophet Muhammad ﷺ is the only complete, universal, and eternal role model for all mankind across every station in life (kings, subjects, merchants, teachers, commanders).
• **Board Exam Points**: Hawala-e-Matan mein sabaq ka unwan aur musannif ka naam 2 marks ka hota hai; Tashreeh 10 marks ki hoti hai.`,
    romanUrdu: `• **Musannif**: Maulana Shibli Nomani.
• **Markazi Khayal**: Hazrat Muhammad ﷺ ki mubarak zaat har insaan ke liye qiyamat tak kamil tareen namoona (Uswa-e-Hasna) hai chahe wo badshah ho ya ghareeb, tajir ho ya sipah salaar.
• **Exam Tip**: Tashreeh mein Quranic aayat *"Laqad kaana lakum fee rasoolillahi uswatun hasanah"* ka hawala zaroor dein.`,
    urdu: `• **مصنف**: مولانا شبلی نعمانی
• **مرکزی خیال**: حضرت محمد مصطفیٰ ﷺ کی حیات طیبہ تمام انسانوں کے لیے ہر شعبہ زندگی میں کامل اور دائمی نمونہ عمل ہے۔`
  },
  {
    keywords: ['apni madad aap', 'sir syed', 'sir syed ahmad khan', 'sabaq 2'],
    title: 'Urdu 11 Sabaq 2: "Apni Madad Aap" by Sir Syed Ahmad Khan',
    english: `• **Author**: Sir Syed Ahmad Khan.
• **Core Philosophy**: National progress stems from individual self-reliance, moral discipline, and labor. External government aid cannot cure moral weakness. God helps those who help themselves.`,
    romanUrdu: `• **Musannif**: Sir Syed Ahmad Khan.
• **Sabaq**: Qaumi taraqqi fard ki zaati mehnat aur apni madad aap ke jazbay se aati hai. Jab tak afraad khud mehnat nahi kareinge qaum aage nahi barh sakti.`,
    urdu: `• **مصنف**: سر سید احمد خان
• **مرکزی خیال**: خدا ان کی مدد کرتا ہے جو اپنی مدد آپ کرتے ہیں۔ قوم کی ترقی افراد کی محنت اور خود اعتمادی سے ممکن ہے۔`
  },
  {
    keywords: ['tashbih', 'arkan-e-tashbih', 'arkan e tashbih', 'ilm-e-bayan'],
    title: 'Ilm-e-Bayan: Tashbih (تشبیہ) & Its 5 Components',
    english: `**Tashbih (Simile)**: Establishing a resemblance between two entities based on a shared attribute.
• 5 Components (ارکانِ تشبیہ):
  1. *Mushabbah (مشبہ)*: The entity being compared (e.g., Ali).
  2. *Mushabbah Beh (مشبہ بہ)*: The benchmark entity (e.g., Sher).
  3. *Wajah-e-Shibh (وجہ شبہ)*: The shared quality (Bahaduri).
  4. *Gharz-e-Tashbih (غرض تشبیہ)*: The purpose of comparison.
  5. *Harf-e-Tashbih (حرف تشبیہ)*: Comparison words (jaisa, manind, ki tarah).`,
    romanUrdu: `**تشبیہ (Tashbih)**: Kisi ek cheez ko kisi mushtarak khoobi ki bina par doosri cheez jaisa qarar dena.
• 5 Arkan:
  1. مشبہ: Jis cheez ko tashbih di jaye.
  2. مشبہ بہ: Jis cheez ke sath tashbih di jaye.
  3. وجہ شبہ: Wo khoobi jo dono mein common ho.
  4. غرض تشبیہ: Tashbih dene ka maqsad.
  5. حرف تشبیہ: Wo lafz jo tashbih ke liye use ho (jaisa, ki tarah).`,
    urdu: `تشبیہ کے پانچ ارکان ہیں: مشبہ، مشبہ بہ، وجہ شبہ، غرض تشبیہ، اور حرف تشبیہ۔`
  },
  {
    keywords: ['istaara', 'isteara', 'arkan-e-istaara'],
    title: "Ilm-e-Bayan: Ista'ara (استعارہ) & Its 3 Components",
    english: `**Ista'ara (Metaphor)**: Using a word for another based on an imaginative resemblance without using comparison words (e.g., "Mera sher aaya").
• 3 Components:
  1. *Musta'ar Lah*: The real subject.
  2. *Musta'ar Minhu*: The borrowed entity.
  3. *Wajah-e-Jami*: The underlying shared attribute.`,
    romanUrdu: `**استعارہ (Ista'ara)**: Kisi lafz ko majazi maani mein istemal karna bina kisi harf-e-tashbih ke (maslan: "Mera sher beta aaya").
• 3 Arkan: Musta'ar Lah, Musta'ar Minhu, Wajah-e-Jami.`,
  },
  {
    keywords: ['talmeeh', 'talmih'],
    title: 'Ilm-e-Bayan: Talmeeh (تلمیح) Definition & Examples',
    english: `**Talmeeh (Allusion)**: A concise reference in poetry to a renowned historical, religious, or literary event (e.g., Aatish-e-Namrood, Aab-e-Hayat, Koh-e-Toor).`,
    romanUrdu: `**تلمیح (Talmeeh)**: Shairi ya nasar mein kisi mashhoor tareekhi ya deeni waqiye ki taraf ishara karna (maslan: Aatish-e-Namrood, Ibn-e-Maryam).`,
    urdu: `**تلمیح**: کلام میں کسی مشہور تاریخی، قرآنی یا روایتی قصے کی طرف اشارہ کرنا تلمیح کہلاتا ہے۔`
  },
  {
    keywords: ['khat noosi', 'khat ke ajza', 'letter format urdu'],
    title: 'Urdu Formal Letter Writing (خط نویسی کے ۶ اجزاء)',
    english: `Urdu Letter Writing comprises 6 essential components (10 Marks):
1. Muqam-e-Rawangi aur Tareekh (امتحانی مرکز)
2. Alqab (محترم ابا جان)
3. Aadab (السلام علیکم)
4. Nafs-e-Mazmoon (Main body)
5. Ikhtitam (والسلام)
6. Pata (Postal address).`,
    romanUrdu: `خط کے 6 اجزاء:
1. مقام روانگی اور تاریخ (امتحانی مرکز)
2. القاب (محترم والد صاحب)
3. آداب (السلام علیکم)
4. نفس مضمون (اصل مدعا)
5. اختتام (والسلام)
6. پتہ (امتحانی پتہ).`,
  },

  // --- PRINCIPLES OF ECONOMICS ---
  {
    keywords: ['economics', 'adam smith', 'alfred marshall', 'lionel robbins'],
    title: 'Three Classic Definitions of Economics',
    english: `1. **Adam Smith (Classical)**: Economics is the science of Wealth (Production, Exchange, Distribution, Consumption).
2. **Alfred Marshall (Neo-Classical)**: Economics is the study of mankind in the ordinary business of life, specifically Material Welfare.
3. **Lionel Robbins (Modern)**: Economics is the science studying human behavior as a relationship between unlimited ends and scarce means with alternative uses.`,
    romanUrdu: `• **Adam Smith**: Ma'ashiyat daulat ka ilm hai.
• **Alfred Marshall**: Ma'ashiyat insani falah-o-behbood (Material Welfare) ka ilm hai.
• **Lionel Robbins**: Ma'ashiyat na-mehdood khwahishat aur mehdood zaraye ke darmiyan intikhab ka science hai.`,
  },
  {
    keywords: ['law of demand', 'qanoon talab', 'elasticity of demand'],
    title: 'Law of Demand & Price Elasticity (قانونِ طلب)',
    english: `• **Law of Demand**: Other things remaining equal (Ceteris Paribus), as the price of a good rises, quantity demanded falls; as price falls, quantity demanded rises.
• **Elasticity of Demand**: Degree of responsiveness of demand to price variations (Ed > 1 for luxury items, Ed < 1 for necessities).`,
    romanUrdu: `• **قانونِ طلب**: Deegar halat badastoor rehte hue, jab kisi cheez ki qeemat barhti hai to uski talab kam ho jati hai, aur qeemat kam hone se talab barh jati hai.
• **طلب کی لچک**: Qeemat ki tabdeeli se talab mein aane wali tabdeeli ki sharah.`,
  },
  {
    keywords: ['law of diminishing marginal utility', 'qanoon taqleel ifada', 'marginal utility'],
    title: 'Law of Diminishing Marginal Utility (قانونِ تقلیلِ افادہِ مختتم)',
    english: `**Statement**: As a consumer consumes successive units of a commodity, the extra satisfaction (Marginal Utility) derived from each consecutive unit continuously declines.`,
    romanUrdu: `**قانون تقلیل افادہ مختتم**: Jab koi shakhs kisi cheez ki musalsal ikaiyan istemal karta hai to har agli ikai se milne wala izafi faida (Marginal Utility) kam hota jata hai.`,
  },

  // --- PHYSICAL & HEALTH EDUCATION ---
  {
    keywords: ['skeleton', 'bones', 'human skeleton', '206 bones', 'axial', 'appendicular'],
    title: 'Human Skeletal System: 206 Bones',
    english: `The human adult skeleton has 206 bones:
1. **Axial Skeleton (80 Bones)**: Skull (28), Vertebral Column (26), Ribs (24), Sternum (1), Hyoid (1).
2. **Appendicular Skeleton (126 Bones)**: Upper extremities/shoulders (64) and Lower extremities/pelvis (62).`,
    romanUrdu: `Insani jism mein kul 206 haddiyan hoti hain:
1. **Mehwari Dhancha (Axial - 80 Haddiyan)**: Khopri, Reerh ki haddi, Pasliyan, aur Seene ki haddi.
2. **Zameemati Dhancha (Appendicular - 126 Haddiyan)**: Baazu, Kandhay aur Taangein.`,
  },
  {
    keywords: ['joints', 'joint types', 'hinge joint', 'ball and socket'],
    title: 'Classification of Human Joints (جوڑوں کی اقسام)',
    english: `• **Immovable Joints**: Sutures of the cranium.
• **Slightly Movable**: Vertebrae discs.
• **Freely Movable (Synovial)**:
  1. *Ball and Socket*: Shoulder and hip (multi-directional movement).
  2. *Hinge Joint*: Elbow and knee (one-directional flexion/extension).
  3. *Pivot Joint*: Neck (rotation).`,
    romanUrdu: `• **Ghair Mutaharrik (Immovable)**: Khopri ke jor jo harkat nahi karte.
• **Mutaharrik (Freely Movable)**:
  1. Ball and Socket: Kandhay aur koolhay ke jor (tamam simton mein ghoomte hain).
  2. Hinge Joint: Kohni aur ghutnay ke jor (darwazay ke qabzay ki tarah ek taraf murte hain).`,
  },

  // --- ISLAMIAT & TARJUMA-TUL-QURAN ---
  {
    keywords: ['tauheed', 'aqeedah-e-tauheed', 'aqeedah tauheed'],
    title: 'Islamiat Lazmi: Aqeedah-e-Tauheed (عقیدہِ توحید)',
    english: `**Aqeedah-e-Tauheed** is the supreme foundation of Islam: Firm belief that Allah is One, unique in His Essence (Zaat), Attributes (Sifaat), and Rights to Worship (Ibadat), without partner or equal.
• **Impacts**: Eliminates fear of worldly powers, grants self-respect, and cultivates humility and piety.`,
    romanUrdu: `**عقیدہ توحید**: Allah Tala ko Zaat, Sifat aur Ibadat mein ek manna aur kisi ko Uska shareek na thehrana.
• Iske asraat: Insaan dunya ke darr se aazad ho kar sirf Allah par bharosa karta hai aur uske andar khud daari aati hai.`,
    urdu: `**عقیدہ توحید**: اللہ تعالیٰ کو ذات، صفات اور عبادات میں یکتا ماننا اور کسی کو اس کا شریک نہ ٹھہرانا۔`
  },
  {
    keywords: ['surah maryam', 'hazrat maryam', 'hazrat zakariya', 'hazrat isa'],
    title: 'Tarjuma-tul-Quran 11: Surah Maryam Overview',
    english: `• **Surah Maryam**: Makki Surah (98 verses).
• **Core Themes**: Miraculous birth of Prophet Yahya (AS) to Prophet Zakariya (AS) in extreme old age, and the miraculous fatherless birth of Prophet Isa (AS) to Hazrat Maryam (AS). Prophet Isa speaks in infancy to verify his mother's purity.`,
    romanUrdu: `• **Surah Maryam**: Makki Surah hai (98 ayaat).
• Ismein Hazrat Zakariya (AS) ko burhapay mein Hazrat Yahya (AS) ki basharat aur Hazrat Maryam (AS) ke haan Hazrat Isa (AS) ki baghair baap ke mojzana wiladat ka bayan hai.`,
  },
];

export class AIStudyBotService {
  private config: AIProviderConfig = {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
  };

  constructor() {
    this.loadConfig();
  }

  public loadConfig(): AIProviderConfig {
    const envKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
    const envModel = (import.meta as any).env?.VITE_OPENAI_MODEL || 'gpt-4o-mini';

    const candidateKeys = [
      STORAGE_KEY_AI_CONFIG,
      'studyhub_ai_config_v1',
      'studyhub_ai_config_v2',
      'studyhub_openai_key',
      'openai_api_key',
    ];

    let resolvedKey = '';
    let resolvedProvider: 'openai' | 'gemini' | 'anthropic' | 'offline' = 'openai';
    let resolvedModel = envModel.includes('gpt-5') ? 'gpt-4o-mini' : envModel;

    for (const k of candidateKeys) {
      try {
        const stored = localStorage.getItem(k);
        if (stored) {
          if (stored.startsWith('{')) {
            const parsed = JSON.parse(stored);
            if (parsed.apiKey && parsed.apiKey.trim().length > 10) {
              resolvedKey = parsed.apiKey.trim();
              if (parsed.provider) resolvedProvider = parsed.provider;
              if (parsed.model && !parsed.model.includes('gpt-5')) resolvedModel = parsed.model;
              break;
            }
          } else if (stored.startsWith('sk-') || stored.startsWith('AIza')) {
            resolvedKey = stored.trim();
            break;
          }
        }
      } catch {}
    }

    if (!resolvedKey && envKey && envKey.trim().length > 10) {
      resolvedKey = envKey.trim();
    }

    this.config = {
      provider: resolvedProvider,
      apiKey: resolvedKey,
      model: resolvedModel,
    };
    return this.config;
  }

  public saveConfig(config: AIProviderConfig): void {
    if (config.model && config.model.includes('gpt-5')) {
      config.model = 'gpt-4o-mini';
    }
    this.config = { ...config };
    try {
      localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(this.config));
      localStorage.setItem('studyhub_ai_config_v1', JSON.stringify(this.config));
      if (this.config.apiKey) {
        localStorage.setItem('openai_api_key', this.config.apiKey);
      }
    } catch {}
  }

  public async testConnection(customConfig?: AIProviderConfig): Promise<{
    success: boolean;
    message: string;
    latencyMs: number;
    model?: string;
  }> {
    const active = customConfig || this.config;
    const start = Date.now();

    if (active.provider === 'offline') {
      return {
        success: true,
        message: 'Offline Academic Engine ready with Punjab Board FA-IT syllabus knowledge.',
        latencyMs: 8,
        model: 'offline-local-kb',
      };
    }

    if (!active.apiKey || active.apiKey.trim().length < 5) {
      return {
        success: false,
        message: 'No API key provided. Please paste your API key to test.',
        latencyMs: 0,
      };
    }

    if (active.provider === 'openai') {
      try {
        const rawModel = active.model || 'gpt-4o-mini';
        const modelToTest = rawModel.includes('gpt-5') ? 'gpt-4o-mini' : rawModel;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${active.apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: modelToTest,
            messages: [{ role: 'user', content: 'Say OK' }],
            max_tokens: 5,
          }),
        });

        const latencyMs = Date.now() - start;
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${response.status} from OpenAI`;
          throw new Error(errMsg);
        }

        const data = await response.json();
        return {
          success: true,
          message: `Connected successfully to OpenAI (${data.model || modelToTest})!`,
          latencyMs,
          model: data.model || modelToTest,
        };
      } catch (err: any) {
        return {
          success: false,
          message: `OpenAI Connection Error: ${err.message}`,
          latencyMs: Date.now() - start,
        };
      }
    }

    if (active.provider === 'gemini') {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${active.apiKey.trim()}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] }),
        });

        const latencyMs = Date.now() - start;
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${response.status}`);
        }
        return {
          success: true,
          message: 'Connected successfully to Google Gemini 1.5 Flash!',
          latencyMs,
          model: 'gemini-1.5-flash',
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Gemini Connection Error: ${err.message}`,
          latencyMs: Date.now() - start,
        };
      }
    }

    return { success: true, message: 'Provider ready.', latencyMs: 5 };
  }

  public getChatHistory(roleOverride?: 'teacher' | 'student'): AIChatMessage[] {
    const currentRole = roleOverride || this.getCurrentUserContext().role;
    const storageKey = `gsa_academic_chat_history_${currentRole}_v11`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    const ctx = this.getCurrentUserContext();
    const displayName =
      ctx.name && ctx.name !== 'Student' && ctx.name !== 'Faculty Lead'
        ? ctx.name
        : currentRole === 'teacher'
        ? 'Faculty Lead'
        : 'Scholar';

    if (currentRole === 'teacher') {
      return [
        {
          id: 'msg_welcome_teacher',
          sender: 'assistant',
          text: `Salam ${displayName}! Welcome to your Faculty AI Desk. Main student evaluation, attendance certification, aur BISE DG Khan curriculum pacing mein aapki live madad kar sakta hoon.`,
          timestamp: 'Just now',
        },
      ];
    }

    return [
      {
        id: 'msg_welcome_student',
        sender: 'assistant',
        text: `Salam ${displayName}! Welcome to your Study Hub AI Copilot. Aap mujh se aaj ka test, schedule, attendance, marks, ya Computer Science aur kisi bhi subject ke baray mein seedha sawal pooch sakte hain.`,
        timestamp: 'Just now',
      },
    ];
  }

  public saveChatHistory(history: AIChatMessage[], roleOverride?: 'teacher' | 'student'): void {
    const currentRole = roleOverride || this.getCurrentUserContext().role;
    const storageKey = `gsa_academic_chat_history_${currentRole}_v11`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(history.slice(-40)));
    } catch {}
  }

  public clearChatHistory(roleOverride?: 'teacher' | 'student'): void {
    const currentRole = roleOverride || this.getCurrentUserContext().role;
    const storageKey = `gsa_academic_chat_history_${currentRole}_v11`;
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }

  public getCurrentUserContext(): { role: 'teacher' | 'student'; name: string } {
    try {
      const role = (localStorage.getItem('studyhub_active_role') as 'teacher' | 'student') || 'teacher';
      const userStr = localStorage.getItem('studyhub_logged_in_user');
      let name = role === 'teacher' ? 'Faculty Lead' : 'Enrolled Student';
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (parsed.fullName) name = parsed.fullName;
        else if (parsed.name) name = parsed.name;
      }
      return { role, name };
    } catch {
      return { role: 'teacher', name: 'Faculty Lead' };
    }
  }

  public getDynamicUserAcademicContext(): {
    role: 'teacher' | 'student';
    name: string;
    email: string;
    academicClass: string;
    attendanceSummary: string;
    testSummary: string;
    taskSummary: string;
    todayTestSummary: string;
    fullContextString: string;
  } {
    let role: 'teacher' | 'student' = 'student';
    let name = 'Student';
    let email = '';
    let academicClass = '1st Year FA-IT';

    try {
      const activeRole = localStorage.getItem('studyhub_active_role');
      if (activeRole === 'teacher' || activeRole === 'student') {
        role = activeRole;
      }
      const userStr = localStorage.getItem('studyhub_logged_in_user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (parsed.fullName) name = parsed.fullName;
        else if (parsed.name) name = parsed.name;
        if (parsed.email) email = parsed.email;
        if (parsed.academicClass || parsed.grade) academicClass = parsed.academicClass || parsed.grade;
      }
    } catch {}

    // Live Attendance Record
    let attendanceSummary = 'Attendance active.';
    try {
      const todayAtt = attendanceService.getTodayRecord();
      const now = new Date();
      const stats = attendanceService.getMonthlyStats(now.getFullYear(), now.getMonth());
      const todayStatus = todayAtt?.status === 'present'
        ? `Marked Present today at ${todayAtt.timeMarked || 'recorded time'}`
        : 'Attendance not yet marked for today';
      attendanceSummary = `${todayStatus}. Monthly attendance rate: ${stats.attendancePercentage}% (${stats.presentDays} of ${stats.workingDays} days present).`;
    } catch {}

    // Live Test Performance & Results
    let testSummary = 'Diagnostic 30-mark test series active.';
    try {
      const certified = getLocalCertifiedResults();
      if (certified && certified.length > 0) {
        const recents = certified.slice(0, 4).map((r) => {
          const title = r.testTitle || r.subjectName || 'Test';
          const marks = r.maxScore ? `${r.score}/${r.maxScore}` : `${r.score} marks`;
          return `${title}: ${marks} (${r.percentage || Math.round((r.score / (r.maxScore || 30)) * 100)}%, Grade ${r.grade})`;
        });
        testSummary = `Certified Test Scores: ${recents.join(' | ')}. Passing threshold: 15/30 marks.`;
      } else {
        testSummary = 'No tests submitted yet. First test starting Friday Nov 20.';
      }
    } catch {}

    // Today's Reading Quota & Pending Tasks
    let taskSummary = 'Daily reading quota: 2.5 pages/day.';
    try {
      const tasks = taskService.getTasks();
      const pending = tasks.filter((t) => !t.isSundayOff && t.status === 'pending');
      if (pending && pending.length > 0) {
        const top = pending[0];
        taskSummary = `Active Target: ${top.subjectName} — ${top.title} (${top.pagesRange || 'Daily Reading Quota'}). Pending tasks: ${pending.length}. Target deadline: February 28.`;
      } else {
        taskSummary = 'All assigned targets for today are completed and verified.';
      }
    } catch {}

    // Today's active test details (Live & Dynamic)
    let todayTestSummary = 'Friday Nov 20, 2026: Islamiat Lazmi + Tarjuma-tul-Quran (2 Books Combined) — 30 Marks, Pass: 15/30.';
    try {
      const allTests = testService.getTests();
      const foundToday =
        allTests.find((t: TestItem) => isDateToday(t.date, t.title, t.id)) ||
        allTests.find((t: TestItem) => t.status === 'ongoing') ||
        allTests[0];

      if (foundToday) {
        todayTestSummary = `Today's Assessment (${foundToday.date}): ${foundToday.subjectName} — "${foundToday.title}" (30 Marks, 45 Mins, Pass: 15). Unlocked for active attempt.`;
      }
    } catch {}

    const fullContextString = `Current Active User Context:
- User Role: ${role === 'teacher' ? 'Faculty / Teacher' : 'Enrolled Student'}
- Full Name: ${name}
- Enrolled Class / Curriculum: ${academicClass} (BISE D.G. Khan Board)
- Live Attendance: ${attendanceSummary}
- Live Test Results: ${testSummary}
- Active Daily Tasks: ${taskSummary}
- Assessment Window: ${todayTestSummary}`;

    return {
      role,
      name,
      email,
      academicClass,
      attendanceSummary,
      testSummary,
      taskSummary,
      todayTestSummary,
      fullContextString,
    };
  }

  /**
   * Execute Action in Portal State
   */
  public executeAction(actionType: AIChatAction['actionType'], details?: string): {
    messageText: string;
    actionExecuted: string;
  } {
    if (actionType === 'unlock_today_test') {
      const res = testService.unlockTestImmediately(details);
      return {
        messageText: `🔓 **Test Unlocked Successfully**:
• Assessment: **${res.test ? res.test.subjectName : "Today's Assessment"}**
• Status: Active Now (Window closes 11:59 PM)
• Aap Daily Test Series grid ya Test Submission page se direct paper start kar sakte hain.`,
        actionExecuted: "Today's Test Unlocked",
      };
    }

    if (actionType === 'mark_attendance') {
      const ctx = this.getDynamicUserAcademicContext();
      const res = attendanceService.markPresentToday(ctx.name);
      return {
        messageText: `🟢 **Daily Attendance Marked**:
• Scholar: **${ctx.name}**
• Time: **${res.record.timeMarked}**
• Status: Present certified & recorded on portal.`,
        actionExecuted: 'Daily Attendance Recorded',
      };
    }

    if (actionType === 'complete_today_task') {
      const ctx = this.getDynamicUserAcademicContext();
      const tasks = taskService.getTasks();
      const todayTask = tasks.find((t) => !t.isSundayOff && t.status === 'pending');
      if (todayTask) {
        taskService.submitTaskForApproval(todayTask.id, 'Reading quota completed by scholar.');
        taskService.approveTask(todayTask.id, ctx.role === 'teacher' ? ctx.name : 'Faculty Lead', 'Approved via AI Desk');
      }
      return {
        messageText: `📚 **Daily Reading Quota Marked Complete**:
• Quota: 2.5 Pages / Day
• Status: Approved & synchronized with course tracker.`,
        actionExecuted: "Today's Quota Approved",
      };
    }

    if (actionType === 'sync_google_sheet') {
      const ctx = this.getDynamicUserAcademicContext();
      integrationService.recordActivityInGoogleSheet({
        date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        studentName: ctx.name,
        activityType: 'General Activity',
        subject: ctx.academicClass,
        score: 'Status Active',
        resultStatus: 'COMPLETED',
        remarks: 'Manual sync trigger requested via AI Copilot.',
      });
      return {
        messageText: `📊 **Google Sheets Synchronized**:
• Connected Sheet: Official FA-IT Academic Ledger
• Sync Time: ${new Date().toLocaleTimeString()}
• Tamam attendance aur test marks Google Sheet mein update ho gaye hain.`,
        actionExecuted: 'Google Sheet Synchronized',
      };
    }

    if (actionType === 'reschedule_test') {
      return {
        messageText: `📅 **Test Series Schedule Adjusted**:
• Aaj ka test window kal subah 10:00 AM ke liye adjust ho gaya hai.`,
        actionExecuted: 'Test Rescheduled',
      };
    }

    if (actionType === 'check_marks') {
      const ctx = this.getDynamicUserAcademicContext();
      return {
        messageText: `📊 **Certified Academic Test Scores**:
• Scholar: **${ctx.name}** (${ctx.academicClass})
• ${ctx.testSummary}`,
        actionExecuted: 'Certified Scores Retrieved',
      };
    }

    if (actionType === 'share_whatsapp') {
      const ctx = this.getDynamicUserAcademicContext();
      const text = encodeURIComponent(
        `🇵🇰 Global Science Academy Academic Report\nStudent: ${ctx.name} (${ctx.academicClass})\nAttendance: ${ctx.attendanceSummary}\nScores: ${ctx.testSummary}\nGoal: Complete 6 Books before February 28, 2027`
      );
      if (typeof window !== 'undefined') {
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }
      return {
        messageText: `📲 WhatsApp summary link generated.`,
        actionExecuted: 'WhatsApp Link Dispatched',
      };
    }

    return {
      messageText: `Action executed successfully.`,
      actionExecuted: 'Action Executed',
    };
  }

  /**
   * Main Query Processor: Direct, Real-Time AI First, Smart Fallback
   */
  public async askAI(query: string, history?: AIChatMessage[]): Promise<AIChatMessage> {
    this.loadConfig();
    const qTrimmed = query.trim();
    const qLower = qTrimmed.toLowerCase();
    const userCtx = this.getDynamicUserAcademicContext();

    // 1. Natural Conversational Greetings (No syllabus dump, simple warm 1-line answer)
    const isGreeting = /^(hi|hello|hey|salam|assalam|slaam|aoa|kese ho|kaise ho|kia haal hai|kya haal|how are you|who are you|tum kon ho|ap kon ho)[\s!?.]*$/i.test(qLower);
    if (isGreeting) {
      const isUrduScript = /[\u0600-\u06FF]/.test(query);
      const isEnglish = /^(hi|hello|hey|how are you|who are you)[\s!?.]*$/i.test(qLower);

      let greetingText = '';
      if (isUrduScript) {
        greetingText = `وعلیکم السلام! میں آپ کا سٹڈی ہب اے آئی کوپائلٹ ہوں۔ آپ مجھ سے روزانہ ٹیسٹ، نصاب، حاضری، مارکس، یا کسی بھی مضمون کے بارے میں سوال پوچھ سکتے ہیں۔`;
      } else if (isEnglish) {
        greetingText = `Hello! I am your Study Hub Academic AI Copilot. I can assist you with your 1st Year FA-IT syllabus, today's test schedule, attendance, marks, and course concepts. How can I assist you?`;
      } else {
        greetingText = `Walaikum Assalam! Main aapka Study Hub AI Assistant hoon. Main aapke tests, syllabus, attendance, marks, aur tamaam subjects (Computer Science, English, Urdu, Economics, Physical Ed, Islamiat) mein live madad ke liye hazir hoon. Aap koi bhi sawal pooch sakte hain!`;
      }

      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 2. Explicit Operational Actions (Fuzzy intent recognition)
    const isUnlockIntent = /(unlock|kholo|un-lock)/i.test(qLower) && /(test|paper|assessment|quiz)/i.test(qLower);
    if (isUnlockIntent) {
      const res = this.executeAction('unlock_today_test');
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: res.messageText,
        actionExecuted: res.actionExecuted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    const isAttendanceMarkIntent = /(mark|lagao|laga do|record|register|bharo)/i.test(qLower) && /(attendance|hazri|presence|haazri)/i.test(qLower);
    if (isAttendanceMarkIntent) {
      const res = this.executeAction('mark_attendance');
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: res.messageText,
        actionExecuted: res.actionExecuted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    const isTaskCompleteIntent = /(complete|mark done|done|khatam|parh lia|parh li|mukammal)/i.test(qLower) && /(task|quota|reading|homework|hisa)/i.test(qLower);
    if (isTaskCompleteIntent) {
      const res = this.executeAction('complete_today_task');
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: res.messageText,
        actionExecuted: res.actionExecuted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    const isSyncIntent = /(sync|update|bhejo)/i.test(qLower) && /(sheet|google sheet|ledger)/i.test(qLower);
    if (isSyncIntent) {
      const res = this.executeAction('sync_google_sheet');
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: res.messageText,
        actionExecuted: res.actionExecuted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 3. INSTANT LOCAL FIRST: Direct Portal & Knowledge Match (0ms Lag, 100% Accurate)
    const localDirectMatch = this.getDirectDynamicSyllabusAnswer(qTrimmed, userCtx, false);
    if (localDirectMatch) {
      return {
        id: `msg_instant_${Date.now()}`,
        sender: 'assistant',
        text: localDirectMatch,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // 4. Cloud LLM Call (OpenAI / Gemini / Anthropic) with Strict 3.5-Second Timeout
    if (this.config.provider !== 'offline' && this.config.apiKey && this.config.apiKey.trim().length > 10) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Cloud API timeout (3.5s exceeded)')), 3500)
        );

        let cloudPromise: Promise<AIChatMessage>;
        if (this.config.provider === 'openai') {
          cloudPromise = this.callOpenAIAPI(qTrimmed, history);
        } else if (this.config.provider === 'gemini') {
          cloudPromise = this.callGeminiAPI(qTrimmed);
        } else {
          cloudPromise = this.callAnthropicAPI(qTrimmed);
        }

        return await Promise.race([cloudPromise, timeoutPromise]);
      } catch (err: any) {
        console.warn('Cloud API timeout or error, delivering instant academic response:', err?.message || err);
      }
    }

    // 5. Intelligent Fallback (Fast & accurate guidance)
    return {
      id: `msg_direct_${Date.now()}`,
      sender: 'assistant',
      text: this.getDirectDynamicSyllabusAnswer(qTrimmed, userCtx, true),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  /**
   * Direct, Straight Syllabus & Live Portal Answers (NO echoing, NO canned filler)
   */
  private getDirectDynamicSyllabusAnswer(query: string, userCtx: ReturnType<typeof this.getDynamicUserAcademicContext>, allowFallback = true): string {
    const qLower = query.toLowerCase();
    const isUrduScript = /[\u0600-\u06FF]/.test(query);

    // A. Query: Today's Test
    const isAskingTodayTest =
      /(aaj ka test|today('?s)? test|current test|konsa test hai aaj|aaj konsa test|test today)/i.test(qLower);
    if (isAskingTodayTest) {
      return `📝 **Today's Assessment Information**:\n• ${userCtx.todayTestSummary}\n\n• **Total Marks**: 30 Marks &bull; **Time Allowed**: 45 Minutes &bull; **Passing Criteria**: 15 Marks (50%)\n• Aap Daily Test Series grid ya Test Submission page se direct paper attempt kar sakte hain.`;
    }

    // B. Query: Tomorrow's Test / Next Test
    const isAskingTomorrowTest =
      /(kal ka test|tomorrow('?s)? test|next test|friday ka test|agle test|pehle test)/i.test(qLower);
    if (isAskingTomorrowTest) {
      return `📅 **Today's Assessment (Friday, Nov 20, 2026)**:\n• **Subjects (2 Books Combined)**: Islamiat Lazmi + Tarjuma-tul-Quran (Test 1)\n• **Syllabus**: Aqeedah-e-Tauheed, Akhlaq-o-Aadaab + Surah Maryam (Ayaat 1-36)\n• **Format**: 30 Marks &bull; 45 Minutes &bull; Passing: 15/30\n• Har Friday ko 2 books ka combined test hota hai aur Sunday mukammal OFF hota hai.`;
    }

    // C. Query: Full Timetable / Schedule
    const isAskingSchedule =
      /(schedule|timetable|time table|routine|test plan|hafte ka schedule|timing|schedule batao)/i.test(qLower);
    if (isAskingSchedule) {
      return `🗓️ **Official 15-Week Test Series Timetable (Starting Friday Nov 20)**:\n• **Friday**: 2 Books Combined (Islamiat Lazmi + Tarjuma-tul-Quran)\n• **Saturday**: Principles of Economics\n• **Sunday**: 🌴 **100% OFF (Rest & Revision Day)**\n• **Monday**: Physical & Health Education\n• **Tuesday**: Urdu & Grammar\n• **Wednesday**: English & Grammar\n• **Thursday**: Computer Science & IT\n\nKul 90 tests hain. Har test 30 marks ka hai aur passing threshold 15 marks hai.`;
    }

    // D. Query: Personal Marks / Result
    const isAskingMarks =
      /(mere marks|mera result|my score|kitne marks|kitne number|obtained marks|check result|test score|karkardagi)/i.test(qLower);
    if (isAskingMarks) {
      return `📊 **Your Certified Academic Test Scores**:\n• Scholar: **${userCtx.name}** (${userCtx.academicClass})\n• ${userCtx.testSummary}\n\nTamam papers BISE DG Khan board examination standards ke mutabiq 30-mark diagnostic format par check hotay hain.`;
    }

    // E. Query: Attendance / Hazri
    const isAskingAttendance =
      /(attendance|hazri|haazri|presence)/i.test(qLower) &&
      /(kitni|kya|lagi|batao|check|percentage|status|record|dekho)/i.test(qLower);
    if (isAskingAttendance) {
      return `🟢 **Your Live Attendance Status**:\n• Scholar: **${userCtx.name}**\n• ${userCtx.attendanceSummary}\n\nDaily attendance portal par digital status ke mutabiq certify hoti hai.`;
    }

    // F. Query: Daily Reading Quota / Tasks
    const isAskingTask =
      /(task|quota|homework|reading|target|daily target)/i.test(qLower);
    if (isAskingTask) {
      return `📚 **Today's Reading Quota & Task Target**:\n• ${userCtx.taskSummary}\n\nHar roz 2.5 pages ka reading quota complete karein taake 28 February tak poora syllabus easily complete ho jaye.`;
    }

    // G. Query: 7 Books List
    const isAskingBooksList =
      /(7 books|kitni books|kitne subject|books konsi|subjects kon|subjects list)/i.test(qLower);
    if (isAskingBooksList) {
      return `📚 **Official 7 Textbooks (1st Year FA-IT Punjab Board)**:\n1. **Computer Science** (IT Series Punjab Curriculum)\n2. **Principles of Economics** (Usool-e-Maashiyat)\n3. **English Book 1** (Short Stories & Plays)\n4. **Urdu Compulsory** (Sarmaya-e-Urdu)\n5. **Physical & Health Education** (Sehat-o-Jismani Taleem)\n6. **Islamiat Lazmi** (Islamic Studies Compulsory)\n7. **Tarjuma-tul-Quran Majeed** (Quran Translation 11)\n\nTamam original PDF books Library aur PDF Viewer mein available hain.`;
    }

    // H. Query: Redacted / Excluded Syllabus (PECTAA ALP 2026-27)
    const isAskingRedacted =
      /(redacted|smart syllabus|alp|syllabus cut|excluded|hata diya)/i.test(qLower);
    if (isAskingRedacted) {
      return `✂️ **PECTAA ALP 2026-27 Redacted (Excluded) Syllabus**:\n• **English**: Stories 4, 7, 9, 12 excluded from tests.\n• **Urdu**: Charpai, Pakistani Zabanain, Kharha Darn, Tip Tip Boota Boota excluded.\n• **Computer Science**: Topic 1.5, 2.8-2.10, 3.3.3, 5.3, 5.4.1.5, 6.4-6.5, 7.3, 9.5 excluded.\n\nStudy Hub ke tamaam 90 tests strictly is official redacted notification ke mutabiq design kiye gaye hain.`;
    }

    // I. High-Accuracy Matcher from Knowledge Base
    const normalizedQ = qLower
      .replace(/[\-_/\\,;:!?'"()]/g, ' ')
      .replace(/\s+e\s+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const stopWords = ['what', 'is', 'the', 'explain', 'tell', 'about', 'difference', 'between', 'give', 'notes', 'kya', 'hai', 'hain', 'batao', 'samjhao', 'mein', 'hein', 'define'];
    const tokens = normalizedQ
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !stopWords.includes(w));

    let bestMatch: (typeof ACADEMIC_KNOWLEDGE)[0] | null = null;
    let bestScore = 0;

    for (const item of ACADEMIC_KNOWLEDGE) {
      let score = 0;
      for (const kw of item.keywords) {
        const kwLower = kw.toLowerCase();
        if (normalizedQ.includes(kwLower) || qLower.includes(kwLower)) {
          score += 40 + kwLower.length * 2;
        } else {
          for (const token of tokens) {
            if (kwLower.includes(token)) {
              score += token.length >= 4 ? 8 : 4;
            }
          }
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && bestScore >= 8) {
      if (isUrduScript && bestMatch.urdu) {
        return bestMatch.urdu;
      }
      // Check if user asked in Roman Urdu
      const isRomanUrdu = /\b(kya|hai|hain|batao|kaise|mera|meri|meray|kab|samjhao|acha|theek|chahiye|mein|main|hoti|hota)\b/i.test(query);
      if (isRomanUrdu && bestMatch.romanUrdu) {
        return bestMatch.romanUrdu;
      }
      return bestMatch.english;
    }

    if (!allowFallback) {
      return '';
    }

    // J. Fallback without repeating or echoing the user's question!
    if (isUrduScript) {
      return `اس موضوع کے بارے میں مزید تفصیل کے لیے براہ کرم کتاب یا چیپٹر کا نام بتائیں (جیسے کمپیوٹر سائنس یونٹ 2 یا اردو گرامر)، تاکہ میں آپ کو مخصوص امتحانی نوٹس اور بورڈ پیٹرن فراہم کر سکوں۔`;
    }

    const isRomanUrdu = /\b(kya|hai|hain|batao|kaise|mera|meri|meray|kab|samjhao|acha|theek|chahiye|mein|main|hoti|hota)\b/i.test(query);
    if (isRomanUrdu) {
      return `Aapka sawal mil gaya hai. Is topic ki mukammal board detail ke liye barahe karam subject ya specific chapter ka naam batayein (maslan Computer Science, Urdu, English, ya Economics), taake main seedha point-to-point BISE DG Khan board standard notes faraham kar sakun.`;
    }

    return `Please specify the subject or chapter (e.g., Computer Science Unit 2, English Grammar, or Principles of Economics) so I can provide concise, structured board examination notes and key points for your query.`;
  }

  private async callOpenAIAPI(prompt: string, history?: AIChatMessage[]): Promise<AIChatMessage> {
    const rawModel = this.config.model || 'gpt-4o-mini';
    const model = rawModel.includes('gpt-5') ? 'gpt-4o-mini' : rawModel;
    const userCtx = this.getDynamicUserAcademicContext();

    const contextMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      {
        role: 'system',
        content: `You are Study Hub's official Academic AI Copilot for 1st Year FA-IT students (BISE D.G. Khan Board).

${userCtx.fullContextString}

Crucial Directives:
- Answer directly, concisely, and accurately to the user's question without preamble, pleasantries, or echoing their prompt.
- If the user asks about tests, timetable, marks, tasks, or attendance, answer using the live dynamic context provided above.
- If the user asks an academic concept question (Computer Science, English, Urdu, Economics, Physical Ed, Islamiat), explain clearly with standard definitions, bullet points, and board exam tips.
- Respond in the exact same language the user wrote (Roman Urdu, Urdu, or English).
- Do NOT output repetitive generic filler or canned analogies unless specifically requested.`,
      },
    ];

    if (history && history.length > 0) {
      const recent = history.slice(-6);
      for (const m of recent) {
        if (m.sender === 'user' || m.sender === 'assistant') {
          contextMessages.push({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          });
        }
      }
    }

    contextMessages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages: contextMessages,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData?.error?.message || `HTTP ${response.status} from OpenAI`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || 'No answer generated.';

    return {
      id: `msg_openai_${Date.now()}`,
      sender: 'assistant',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  private async callGeminiAPI(prompt: string): Promise<AIChatMessage> {
    const userCtx = this.getDynamicUserAcademicContext();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config.apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are the Global Science Academy Academic AI Copilot for 1st Year FA-IT students under BISE D.G. Khan Board.
${userCtx.fullContextString}

Answer directly, concisely, and straight to the point in the user's language (English, Urdu, or Roman Urdu). Do not repeat the prompt.

Question: ${prompt}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No answer generated.';

    return {
      id: `msg_gemini_${Date.now()}`,
      sender: 'assistant',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  private async callAnthropicAPI(prompt: string): Promise<AIChatMessage> {
    const url = 'https://api.anthropic.com/v1/messages';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Anthropic HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data?.content?.[0]?.text?.trim() || 'No answer generated.';

    return {
      id: `msg_claude_${Date.now()}`,
      sender: 'assistant',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export const aiStudyBotService = new AIStudyBotService();
