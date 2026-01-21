# Scalability and Wiring Bottlenecks in Quantum Computing

## Executive Summary

Quantum computing stands at a critical inflection point where the technology's transformative potential is increasingly constrained by a fundamental engineering challenge: the physical wiring infrastructure required to control and read out qubits. Current superconducting quantum processors typically require two coaxial cables per qubit, meaning a million-qubit system would demand approximately two million individual wires running from room-temperature electronics down to millikelvin operating temperatures. This wiring bottleneck represents one of the most significant barriers to achieving fault-tolerant quantum computing at commercially useful scales.

The economic implications are substantial. Wiring accounts for approximately 80% of cryostat costs, with a 150-qubit system requiring around $5 million in infrastructure. The quantum computing market, valued at $3.5 billion in 2025 and projected to reach $20 billion by 2030, faces significant uncertainty if the wiring challenge cannot be overcome. Industry leaders including IBM, Google, and Microsoft have roadmaps targeting fault-tolerant systems by 2029-2035, but these timelines are at risk without breakthrough solutions to the interconnect problem.

Multiple promising approaches are under development, including high-density flexible cables from Delft Circuits, on-chip cryogenic control from D-Wave, photonic interconnects, and wireless terahertz links. However, none have yet demonstrated scalability to the millions of qubits required for practical quantum advantage. The race to solve this challenge has attracted significant investment, with French startup Isentroniq raising EUR 7.5 million in October 2025 and DARPA selecting 11 firms for up to $15 million each in quantum benchmarking funding.

## Background & Context

The quantum computing industry emerged from decades of theoretical physics and laboratory research to become a major technology sector attracting billions in investment. Superconducting qubits, pioneered by companies like IBM and Google, have become the leading technology platform due to their relative maturity and manufacturability using semiconductor fabrication techniques. However, these qubits must operate at temperatures near absolute zero (around 15 millikelvin) inside dilution refrigerators, creating unique engineering challenges for signal delivery and control.

Historically, the wiring problem was manageable at small scales. Early quantum processors with tens of qubits could be controlled using conventional coaxial cable infrastructure without overwhelming the cryogenic cooling system. However, as qubit counts grew into the hundreds, the limitations became apparent. Each coaxial cable conducts heat from warmer temperature stages, and the cumulative thermal load from hundreds of cables approaches the cooling capacity limits of dilution refrigerators.

The problem has reached a critical stage as the industry targets thousand-qubit and eventually million-qubit systems. IBM's roadmap envisions fault-tolerant quantum computing by 2029-2033, while Google is working toward a million-qubit system. These ambitions cannot be realized with current wiring approaches. The situation has sparked a parallel industry focused specifically on quantum interconnect solutions, with specialized companies like Delft Circuits, Isentroniq, and Planckian emerging to address this bottleneck.

The challenge is fundamentally about the incompatibility between the macroscopic world of room-temperature electronics and the quantum realm of millikelvin superconducting circuits. Every signal must traverse this temperature gradient, and every wire that does so brings unwanted heat into the quantum system. This has created a design constraint that threatens to limit quantum computing's practical scalability.

## Problem Analysis

### Root Causes

**Physical Limitations of Coaxial Cable Infrastructure**

The most fundamental cause of the wiring bottleneck is the one-to-many relationship between qubits and control lines. Unlike classical transistors that can be controlled through hierarchical bus architectures, each superconducting qubit requires dedicated wiring for control pulses and readout signals. Coaxial cables are used because they provide the necessary bandwidth (typically gigahertz frequencies) and signal integrity, but they cannot be easily multiplexed or miniaturized without degrading performance.

Industry data indicates that a million-qubit processor would require approximately two million individual coaxial lines using current approaches. Even with aggressive miniaturization, the physical volume of this wiring would exceed the capacity of any existing dilution refrigerator, and the manufacturing complexity would be extraordinary.

**Thermal Load Constraints in Cryogenic Systems**

Dilution refrigerators operate through a sophisticated cascade of cooling stages, with the coldest stage (mixing chamber) providing only milliwatts of cooling power at millikelvin temperatures. Every wire running from room temperature to this stage conducts heat, with thermal conductivity being an inherent property of the metallic cables needed for signal transmission.

Research from APL Quantum and other academic sources confirms that "wired power transfer remains a major challenge when scaling quantum computers to large numbers of qubits due to thermal load arising from temperature gradients, power loss and heating by Joule effect, noise coupling from room temperature to cryogenic, and limited scalability caused by interconnect wiring."

**Signal Crosstalk and Electromagnetic Interference**

As wiring density increases, electromagnetic coupling between adjacent signal lines causes crosstalk that introduces errors in qubit operations. This is particularly problematic for two-qubit entangling gates that are sensitive to electrical noise. The close physical proximity required by high-density wiring solutions exacerbates this challenge.

Studies have identified "unknown signal propagation and scattering within the chambers, channel interferences and crosstalk, stray field associated noise on qubit performance, and thermal control at the interfaces between ambient and the refrigerator" as ongoing challenges that worsen with scale.

**Room-Temperature Control Electronics Limitations**

Current quantum computing architectures rely on room-temperature electronics to generate microwave control pulses and process readout signals. These electronics must communicate with qubits operating at millikelvin temperatures through cables spanning this enormous temperature gradient. The resulting signal path introduces latency, limits bandwidth, and requires extensive calibration to maintain signal integrity.

**CMOS-Cryogenic Incompatibility**

Conventional semiconductor electronics cannot operate reliably at millikelvin temperatures, preventing the co-location of control electronics with qubits. While cryogenic CMOS (cryo-CMOS) technology is under development, it typically operates at 4 Kelvin rather than millikelvin temperatures, still requiring some wiring to bridge the final temperature stages.

### Consequences & Impact

**Prohibitive Costs for Scaling**

The economic burden of the wiring bottleneck is severe. Industry sources report that wiring accounts for up to 80% of cryostat costs, meaning a $5 million system for 150 qubits allocates approximately $4 million to wiring infrastructure alone. Extrapolating to million-qubit systems, Isentroniq estimates that current approaches would require "massive facilities and tens of billions of euros."

This cost structure threatens the commercial viability of quantum computing. While the market is projected to grow from $3.5 billion in 2025 to $20 billion by 2030, these projections assume successful scaling that may be impossible without solving the wiring challenge.

**Delayed Achievement of Fault-Tolerant Quantum Computing**

Industry roadmaps from IBM, Google, and Microsoft target fault-tolerant quantum computing by 2029-2035. These timelines depend on deploying thousands to millions of physical qubits with sufficient quality to implement error correction codes. The wiring bottleneck is identified as one of the primary engineering barriers to meeting these milestones.

McKinsey research indicates that 72% of tech executives, investors, and academics expect fault-tolerant quantum computers by 2035, but this timeline is contingent on solving the scalability challenge.

**Degraded Qubit Performance at Scale**

Each additional qubit and its associated wiring increases system noise and thermal load. This creates a negative feedback loop where adding qubits degrades the performance of existing qubits, potentially negating the computational benefits of scaling. Research has shown that "heat and crosstalk from closely integrated control have the potential to degrade qubit performance, particularly for two-qubit entangling gates."

**Delayed Commercial Quantum Advantage**

The inability to scale quantum systems delays practical applications across multiple industries. Drug discovery, financial optimization, cryptography, and materials science all require quantum systems with thousands to millions of high-quality qubits. McKinsey projects that quantum computing could generate $1.3 trillion in value across industries by 2035, but this value creation depends on achieving scalability.

## Current Solutions Landscape

**High-Density Flexible Cryogenic Cables**

Delft Circuits has emerged as a leading provider of specialized quantum interconnect solutions with its Cri/oFlex cable technology. The company's September 2025 roadmap presentation revealed cables delivering up to 8x higher channel density than conventional coaxial systems, with plans to reach 32x density within 18 months. The roadmap projects channel density increasing from 256 channels per loader to 1,024 by 2027 and 4,096 by 2029.

This approach maintains the fundamental architecture of wired connections but dramatically improves efficiency. However, even at 32x improvement, million-qubit systems would still require enormous cable infrastructure.

**On-Chip Cryogenic Control**

D-Wave's November 2025 announcement of successful on-chip cryogenic control for gate-model qubits represents a significant breakthrough. The company adapted control technology from its annealing quantum processors, where multiplexed digital-to-analog converters manage tens of thousands of qubits using approximately 200 wires. This approach "sharply reduces the amount of wiring needed to control many qubits without harming performance."

D-Wave's success demonstrates that control multiplexing is technically feasible, though applying this approach to universal gate-model quantum computing presents additional challenges related to the more demanding control requirements.

**Photonic Interconnects**

Research teams have demonstrated all-optical qubit readout at millikelvin temperatures, eliminating the need for metallic cables entirely for the readout path. Nature Physics published research showing devices that "simultaneously perform upconversion and downconversion between microwave and optical frequencies" without requiring active cryogenic microwave equipment.

The CO-QLink project and related research have demonstrated room-temperature to 4K optical links achieving 56 Gb/s data rates with PAM-4 modulation. Researchers conclude that "multiplexed photonic receivers at 4K can aggressively scale the control of thousands of qubits."

**Global Control Architectures**

Planckian has developed superconducting quantum architectures using global control mechanisms that allow multiple qubits to be manipulated via shared control lines. This approach "decouples control complexity from the number of qubits," fundamentally changing the scaling relationship between qubits and wiring.

**Wireless Terahertz Interconnects**

Nature Electronics published research on wireless terahertz cryogenic interconnects using CMOS transceivers at 260 GHz carrier frequency. This approach could "provide a high-capacity, low-heat interconnect solution for future cryogenic electronic hardware" with information-to-heat transfer ratios approaching theoretical limits.

## Solution Gaps & Opportunities

**Integration of Cryogenic CMOS at Millikelvin Temperatures**

While cryo-CMOS technology shows promise for operation at 4 Kelvin, reliable electronics at the millikelvin temperatures required for superconducting qubits remains elusive. The ARCTIC European Chips Joint Undertaking project is working to establish supply chains for cryogenic quantum technologies, but significant technical challenges remain in power dissipation and noise characteristics at ultra-low temperatures.

**Scalable Manufacturing of Cryogenic Photonic Components**

Photonic solutions have been demonstrated at laboratory scale but lack the manufacturing infrastructure for commercial deployment. A fully packaged cryogenic optical transmitter using commercial CMOS foundry processes was reported in Nature Electronics, but transitioning from research demonstrations to high-volume manufacturing remains a gap.

**Standardization of Quantum Interconnect Technologies**

The current landscape features multiple competing approaches (flex cables, photonic links, wireless THz, cryo-CMOS) being developed independently without industry standardization. This fragmentation may lead to incompatible solutions and duplicated R&D efforts. Opportunities exist for industry consortia to establish common standards.

**Thermal Management for Densely Packed Control Electronics**

Even as wiring density increases or alternative interconnect technologies mature, the fundamental challenge of managing heat generation from control electronics co-located with qubits remains unsolved at scale. Innovation in thermal management techniques and ultra-low-power control electronics represents a significant opportunity.

## Stakeholder Analysis

**Quantum Hardware Companies (High Impact)**

IBM, Google, Microsoft, IonQ, Rigetti, D-Wave, and Quantinuum are directly constrained by the wiring bottleneck. These companies have billion-dollar valuations dependent on achieving scalability. IBM's Starling roadmap targets 200 logical qubits by 2029, while Google pursues a million-qubit system. Their interests include both developing internal solutions and partnering with specialized interconnect companies.

**Quantum Interconnect Startups (High Impact)**

Specialized companies including Delft Circuits (Netherlands), Isentroniq (France), and Planckian have emerged specifically to address the wiring challenge. Isentroniq's EUR 7.5 million funding round in October 2025 demonstrates investor confidence in this market segment. These companies' success or failure will significantly influence the industry's scaling timeline.

**Cryogenic Equipment Manufacturers (Medium Impact)**

Companies like Bluefors and Oxford Instruments provide the dilution refrigerators that form the foundation of superconducting quantum systems. Their equipment designs and cooling capabilities directly constrain what wiring solutions are feasible. They have opportunities to co-develop integrated solutions with qubit and interconnect providers.

**Government Research Agencies (High Impact)**

DARPA's Quantum Benchmarking Initiative selected 11 quantum firms for up to $15 million each in November 2025. The EU Quantum Flagship has allocated $1.07 billion for quantum research, while Germany has committed $3 billion through 2026. Government funding shapes research priorities and accelerates solution development. These agencies seek to maintain national competitiveness in quantum technology.

**Enterprise Customers (Medium Impact)**

Pharmaceutical companies, financial institutions, automotive manufacturers, and energy companies await practical quantum advantage for drug discovery, portfolio optimization, materials simulation, and logistics. Their timelines for quantum-enabled applications depend on scalability progress. They influence the market through cloud quantum computing usage and partnership announcements.

## Research Sources

- [Laser Focus World - Break the wiring bottleneck](https://www.laserfocusworld.com/quantum/article/55284511/break-the-wiring-bottleneck-in-superconducting-quantum-chips) - Comprehensive overview of the wiring bottleneck problem and emerging solutions in superconducting quantum computing

- [The Quantum Insider - Delft Circuits I/O Roadmap](https://thequantuminsider.com/2025/09/19/delft-circuits-presents-its-i-o-roadmap-for-scaling-quantum-computers-towards-thousands-of-qubits/) - Detailed roadmap for high-density cryogenic cable technology scaling to 4,096 channels by 2029

- [Tech.eu - Isentroniq Funding](https://tech.eu/2025/10/14/isentroniq-raises-eur75m-to-tackle-the-wiring-bottleneck-and-scale-quantum-computing/) - Investment landscape and startup ecosystem addressing the wiring challenge

- [D-Wave Press Release - On-Chip Cryogenic Control](https://www.dwavequantum.com/company/newsroom/press-release/d-wave-demonstrates-first-scalable-on-chip-cryogenic-control-of-gate-model-qubits/) - Breakthrough demonstration of scalable control electronics for gate-model qubits

- [APL Quantum - Classical interfaces for cryogenic QC](https://pubs.aip.org/aip/apq/article/2/4/041501/3373674/Classical-interfaces-for-controlling-cryogenic) - Academic analysis of control interface challenges and solutions

- [arXiv - Power Delivery for Cryogenic Scalable Quantum](https://arxiv.org/html/2511.13965) - Technical analysis of power delivery challenges in scaling quantum systems

- [Nature Electronics - Terahertz wireless interconnects](https://www.nature.com/articles/s41928-025-01356-8) - Research on wireless alternatives to wired cryogenic interconnects

- [MarketsandMarkets - Quantum Computing Market Report](https://www.marketsandmarkets.com/Market-Reports/quantum-computing-market-144888301.html) - Market sizing and growth projections for the quantum computing industry

- [Bain Technology Report 2025](https://www.bain.com/insights/quantum-computing-moves-from-theoretical-to-inevitable-technology-report-2025/) - Industry analysis on quantum computing commercialization challenges

- [McKinsey - The Year of Quantum](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-year-of-quantum-from-concept-to-reality-in-2025) - Executive perspectives on quantum computing timelines and value creation

## Methodology Note

This report was generated through AI-assisted research on 2026-01-21.
Research involved web searches across industry publications, academic sources, company press releases, market research reports, and expert analyses. Sources include peer-reviewed journals (Nature Physics, Nature Electronics, APL Quantum), industry publications (Laser Focus World, The Quantum Insider), market research firms (MarketsandMarkets, McKinsey, Bain), and company announcements from major players including D-Wave, Delft Circuits, and Isentroniq.

Confidence level: 78%

The confidence level reflects strong evidence for the existence and severity of the wiring bottleneck problem, well-documented solution approaches under development, and reliable market sizing data. Uncertainty remains regarding the timeline for breakthrough solutions and the ultimate technical path that will prove most successful for million-qubit scaling.
