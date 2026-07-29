---
title: "[Transcript/Vocabulary] Distributed Systems 1.1: Introduction"
date: 2026-07-29
categories: ["english-learning", "transcript", "distributed-systems"]
slug: "transcript-distributed-systems-1-1-introduction"
type: "post"
---

## Reference

Distributed Systems 1.1: Introduction

https://www.youtube.com/watch?v=UEAMfLPZZhE&list=PLeKd45zvjcDFUEv_ohr_HdUFe97RItdiB

## Transcript

### 0:00–1:00 — Concurrency and shared memory

hello everybody my name is martin klepman and i'm going to be giving the next eight lectures on distributed systems this is the second half of the course on concurrent and distributed systems and so in the first half of this course you've seen a lot on concurrency that occurs within a single process so when you have especially when you have multiple threads within a single process that are performing operation concurrently you have seen how to deal with mutual exclusion for example and various algorithms for ensuring safe concurrency now in this kind of concurrent system you have all of the threads usually sharing a single address space and so you can just pass a variable from one thread to another thread and that variable can contain pointers or references to arbitrary objects and this will work because the memory addresses that one thread can access are the same as the memory addresses that another thread can access now when we move to distributed systems

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| concurrency | /kəŋkˈɜːɹənsi/ | The ability for several tasks to make progress during the same time period. | Concurrency lets a server process several requests during the same period. |
| mutual exclusion | /mjˈuːt‍ʃuːə‍l ɛksklˈuːʒən/ | A rule that allows only one thread to use a shared resource at a time. | A mutex provides mutual exclusion while one thread updates the counter. |
| address space | /ɐdɹˈɛs spˈe‍ɪs/ | The range of memory addresses a process can use. | Two threads in one process can read the same address space. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| give a lecture | Teach a class by speaking to an audience. |
| pass ... from one ... to another | Give data from one part of a program to another. |

### 1:00–2:00 — Moving beyond one computer

this changes so in distributed systems we still have concurrency we still have multiple processes and multiple threads performing operations concurrently potentially but we also have the additional challenge that now we're talking about not just a single program running on a single computer but multiple programs running on multiple computers where those computers are communicating via a network and this aspect that we are now introducing this network is part of what makes a distributed system distributed another aspect is also that we don't have a single shared address space anymore so a pointer that makes sense in one process if you send it over the network to another process running on a different computer that pointer will not necessarily make any sense uh to the recipient of that message and so we have to think about different ways of sharing data between these concurrent entities so um a definition of a distributed system somewhat joking

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| distributed system | /dˈɪstɹɪbjˌuːɾᵻd sˈɪstəm/ | A group of computers that work together through a network. | A distributed system may run its database and API on separate machines. |
| recipient | /ɹᵻsˈɪpi‍ənt/ | A person or system that receives something. | The recipient node sends an acknowledgement after receiving the message. |
| entity | /ˈɛntᵻɾi/ | Something that exists separately and can be treated as one unit. | Each entity in the model has its own identifier. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| move to | Change from one situation or topic to another. |
| make sense | Be understandable or have a useful meaning. |

### 2:00–3:00 — Defining distributed systems

definition provided by leslie lamport is that a distributed system is a system in which the failure of a computer you didn't even know existed can render your own computer unusable whether this is a good definition or not we can debate but leslie lamport is a bit of a legend in the area of distributed systems and we will see various aspects of work that he's done over the decades and of course lots of other people have done work in this area and we will see that over the course of these lectures so more generally i think i would define a distributed system as one in which you have got multiple computers or computing devices these devices might be smartphones they might be robots they might be self-driving cars they might be desktop computers there might be servers in the data center so any sort of computing device really and these computing devices are communicating by some kind of network which might be the internet and they are trying to achieve some kind of task

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| render | /ɹˈɛndɚ/ | Cause something to become a particular state. | A failed lookup can render a service unavailable. |
| computing device | /kəmpjˈuːɾɪŋ dɪvˈa‍ɪs/ | A machine that can process data, such as a phone or server. | A phone is a computing device that can participate in the network. |
| coordinate | /ko‍ʊˈɔː‍ɹdᵻnət/ | Organize people or things so they work well together. | The workers coordinate before assigning the next job. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| whether ... or not | Used when both possible answers are being considered. |
| some kind of | A type of something, when the exact type is not important. |

### 3:00–4:00 — Reading material

together and the study of distributed systems is really the study of how do we coordinate the activities of these different devices in such a way that they achieve together the task that they are trying to achieve so i will start with a little bit of background uh first just the administrative things to get that done so uh first of all if you want any further background reading uh on this course hopefully the lecture notes will be reasonably self-contained but of course uh further detail is available in books if you are interested um there are several different styles of books that i've put here on the list so the textbook by van stein and tannenbaum is is a sort of systems level overview so this is it comes at distributed systems from quite an applied angle of real applications that real people use and discusses uh how these work and discusses the various implementation details of it it doesn't go as far into

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| self-contained | /sˈɛlfkəntˈe‍ɪnd/ | Complete enough to be understood without other material. | The example is self-contained, so it runs without external services. |
| overview | /ˈo‍ʊvɚvjˌuː/ | A general description without every detail. | The first lecture gives an overview of the failures to expect. |
| applied | /ɐplˈa‍ɪd/ | Focused on practical use rather than theory alone. | The technique is applied when replicas need to agree on an update. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| first of all | Used to introduce the first point. |
| go into depth | Examine a subject in great detail. |

### 4:00–5:00 — Related disciplines

the theory as some of the other books but it's more practically oriented if you like the theory then the second book on this list is a good choice so the textbook by cashing gerrari and rodriguez is an excellent but quite detailed overview of distributed systems theory so it goes into a lot more depth than we have time to talk about in this course but if you want to read more about the theory this is an excellent book i also wrote a book in this area called designing data intensive applications this book is a bit more oriented towards distributed database systems so it's not just not just distributed systems in general there's a lot of the other databases content in there um but it's and this book is more oriented towards industrial software engineers so people who are working professionally with distributed databases will probably find this uh kind of book useful and finally there's the bacon and harris textbook which was already recommended for the

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| practitioner | /pɹæktˈɪʃənɚ/ | A person who works professionally in a particular field. | A practitioner must consider failures that a classroom example ignores. |
| scheduling | /skˈɛd‍ʒuːlɪŋ/ | Deciding when tasks or processes should run. | The scheduler controls the scheduling of tasks on each CPU. |
| relevant | /ɹˈɛlᵻvənt/ | Closely connected to the subject being discussed. | Clock drift is relevant when machines compare timestamps. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| build on | Use an earlier idea or result as a starting point. |
| in this area | In this subject or field. |

### 5:00–6:00 — Course connections and networking

concurrent systems part of this course which really provides the link between operating systems and distributed systems okay so this course is also connected to various other courses in the tripos most obviously concurrent systems that this course is part of also operating systems which you studied last year so all of the background that you had there on processes and inter-process communication and scheduling of processes all of that stuff is relevant for this course uh also the databases course is connected to distributed systems because as i mentioned just now many modern databases are in fact distributed and they use a lot of the techniques that we will talk about in this course and so using modern databases often involves using distributed systems as well there's a strong connection between distributed systems and computer networking because as i said distributed systems involve network communication generally the difference between the two courses is that the computer networking course is mostly about how do you actually get

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| protocol | /pɹˈo‍ʊɾəkˌɑːl/ | A set of rules for communication between systems. | HTTP is a protocol that defines how clients and servers communicate. |
| mechanism | /mˈɛkənˌɪzəm/ | A method or system used to produce a result. | Retries are one mechanism for handling temporary network errors. |
| sufficiently | /səfˈɪʃəntli/ | Enough for a particular purpose. | The timeout must be sufficiently long for slow networks. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| over the wire | Through a network connection. |
| all about | Mainly concerned with a particular thing. |

### 6:00–7:00 — Networking, security, and cloud computing

the bytes over the wire from one device to the other device so what do the network protocols look like that enable devices to communicate and then distributed systems builds on top of computer networking and saying okay assuming we now have this mechanism for devices to communicate how can we now ensure that these devices behave in the ways that we want there's connection to further java so there's programming exercises that involve a bit of distributed computing um the security aspects of distributed systems are very interesting and they are covered in a course in in easter term uh that's dedicated uh just a topic of security and finally next year's cloud computing course uh builds upon distributed systems because cloud computing is all about being able to flexibly process large amounts of data and if you have sufficiently large amounts of data you generally need a distributed system

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| protocol | /pɹˈo‍ʊɾəkˌɑːl/ | A set of rules for communication between systems. | SMTP is a protocol that defines how mail servers exchange messages. |
| flexibly | /flˈɛksᵻbli/ | In a way that can adapt to different needs. | The system can flexibly add workers as traffic grows. |
| sufficiently | /səfˈɪʃəntli/ | Enough for a particular purpose. | The replicas are sufficiently numerous to tolerate one failure. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| build on | Use an earlier idea or result as a starting point. |
| all about | Mainly concerned with a particular thing. |

### 7:00–8:00 — Why make a system distributed?

in order to process it okay so i gave a brief definition of uh what a distributed system is the next question is then why like why should we go to all of this effort of making a system distributed why can't we just use a single computer and keep things simple and well one reason is that some applications some types of things you want to do computers are inherently distributed so if you want to send a message from your phone to your friend's phone this inevitably involves two different phones and a network so this is a distributed system there's no way around it there's no way of building a messaging system that is not distributed if you want to be able to communicate across different devices and so building this type of software is one reason why we might be interested in distributed systems but many other reasons as well so another good reason for being interested in distributed systems is that it actually allows us to make systems more reliable

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| inherently | /ɪnhˈi‍əɹəntli/ | As a natural and permanent part of something. | Network communication is inherently slower than local memory access. |
| inevitably | /ɪnˈɛvᵻɾəbli/ | In a way that cannot be avoided. | With enough machines, some component will inevitably fail. |
| distributed | /dˈɪstɹɪbjˌuːɾᵻd/ | Spread across more than one computer or place. | The files are distributed across several storage servers. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| go to the effort of | Spend the time and energy needed to do something. |
| no way around it | No possible way to avoid something. |

### 8:00–9:00 — Reliability and global performance

and the reason for this is say you have multiple computers which are each performing part of some some job if one of those fails maybe one of them has to be rebooted for example or one of them has a hardware failure then maybe the remaining computers can take over the work from the failed computer and so now this allows the system as a whole to continue functioning even though one of the computers involved in it has actually gone down another reason we might want to make systems distributed is for better performance so for example in internet distributed systems you might have users all around the world you might have some users in the uk some users in the us some users in new zealand some users in south africa wherever and there are large distances between these different places and so network communication from one of these places to the others is always going to take a a little while uh you know you're talking at least 100 milliseconds

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| reliable | /ɹᵻlˈa‍ɪəbə‍l/ | Able to work correctly and consistently. | A reliable service returns correct results despite ordinary failures. |
| reboot | /ɹᵻbˈuːt/ | Start a computer again after restarting it. | A reboot should not cause a durable database to lose committed data. |
| latency | /lˈe‍ɪtənsi/ | The delay before data reaches its destination. | High latency made each remote request noticeably slower. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| take over | Begin doing work that another person or system was doing. |
| all around the world | In many different places worldwide. |

### 9:00–10:00 — Locality and large-scale computing

simply because of the speed of light that it takes for communication to travel from one continent to another and so one reason why people are interested in distributed systems is to make systems faster by putting data closer to where the people are so if you have some users in multiple different continents you can have computers in multiple different continents and if you have each user communicating with the computer that is most local to them then you avoid the long distance intercontinental communication as part of the delays that are added to their communication so making systems distributed allows us to make them faster potentially and finally another reason why people build distributed systems is to solve bigger problems than they could with a single computer so some computing problems are simply very large scale so think of scientific computing examples like for example the uh the cern at the particle accelerator in

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| infrastructure | /ˈɪnfɹəstɹˌʌkt‍ʃɚ/ | The basic systems and equipment needed for an activity. | The company upgraded its infrastructure before launching the service. |
| vast | /vˈæst/ | Extremely large in size or amount. | The search index contains a vast number of documents. |
| distribute | /dˈɪstɹɪbjˌuːt/ | Share work or resources among several people or systems. | The load balancer can distribute requests across healthy servers. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| work together | Cooperate to complete a shared task. |
| be able to | Have the ability or opportunity to do something. |

### 10:00–11:00 — CERN's computing infrastructure

switzerland that includes the large hadron collider they have a vast computing infrastructure involving a million cpu cores and god knows how many hard disks in order to just take all of the data that they're gathering from the particle accelerator and process it and analyze it and try to [Music] use this to discover new particles for example now this this scale of task would simply be not be possible to achieve on a single computer because there is no supercomputer that is big enough to be able to handle these vast volumes of data so simply solving this problem of analyzing such large volumes of data has to be done on a network of lots of small computers and and those computers have to distribute the work amongst them and they have to work together in order to achieve the tasks that the scientists are trying to do and so uh this is really um one of the another key area in which

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| overloaded | /ˌo‍ʊvɚlˈo‍ʊdᵻd/ | Given more work or traffic than it can handle. | The overloaded server rejected new requests until traffic dropped. |
| maliciously | /mɐlˈɪʃəsli/ | With an intention to cause harm. | An attacker maliciously sent requests designed to exhaust memory. |
| denial-of-service attack | /dᵻnˈa‍ɪə‍lʌvsˈɜːvɪs ɐtˈæk/ | An attack that makes a service unavailable by overwhelming it. | A denial-of-service attack flooded the site with useless traffic. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| be down | Be unavailable or not working. |
| from time to time | Sometimes, but not regularly or continuously. |

### 11:00–12:00 — Networking disadvantages

we can use distributed systems is to solve bigger problems now those are the advantages of making systems distributed there are unfortunately some significant disadvantages as well and the main disadvantage that you will be well familiar with is whenever you're trying to do something over a network that network might not be working for some reason and so everyone has experienced what it's like for the internet to be down or for your wi-fi signal to be weak or for yeah you're in some rural part of the country and your cellular data signal is weak and you're trying to load a map or something like that everyone has experienced this kind of frustration before and well the study of distributed systems is all about the study of such frustrations so we assume whenever we are building a distributed system uh that involves communication over a network that networks are not perfectly reliable and so it is always possible for communication to fail it is always possible that because

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| robust | /ɹo‍ʊbˈʌst/ | Able to keep working well in difficult conditions. | A robust protocol continues after one participant disconnects. |
| interrupted | /ˌɪntɚɹˈʌptᵻd/ | Stopped temporarily before completion. | The upload was interrupted when the client lost its connection. |
| as a whole | /æz ɐ hˈo‍ʊl/ | Considered as one complete system. | The cluster is healthy as a whole even though one node failed. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| continue functioning | Keep working. |
| even if | Used to introduce a condition that does not change the result. |

### 12:00–13:00 — Network interruptions and process crashes

because if it's a wi-fi network you might be out of range if it's a wired network somebody might have unplugged the wrong cable um if it's any any type of network it might just be temporarily overloaded and so it might be dropping messages maybe even somebody might be maliciously trying to interfere with the network and cause it to uh to drop packets maybe causing a denial of service attack for example there are many reasons why communication might not work from time to time and so we have to build systems that are robust so that even if communication is interrupted from time to time the system as a whole still functions in some correct way where of course we can define what we mean with correct but we want it to continue functioning another thing that can go wrong in distributed systems is that some of the processes the running the code might crash and for example if you have a system consisting of multiple computers and you reboot one of them you

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| crash | /kɹˈæʃ/ | Stop working suddenly because of an error. | After a crash, the process restarted from its saved state. |
| non-deterministically | /nˈɑːndɪtˌɜːmɪnˈɪstɪkli/ | In a way whose result or timing cannot be predicted exactly. | Messages may arrive non-deterministically in a concurrent program. |
| remaining | /ɹᵻmˈe‍ɪnɪŋ/ | Still left after other things have gone or failed. | The remaining replicas continued serving reads after one failed. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| carry on | Continue doing something. |
| at any moment | At any possible time. |

### 13:00–14:00 — Unpredictable failures and fault tolerance

probably want the remaining computers to carry on the task of of serving user requests and so what we want here is that one of the processes cur is temporarily out of action and we want the system as a whole to still continue nevertheless and finally all of these failures can happen non-deterministically and that is we simply don't know when they happen they could happen at any moment unpredictably and we still have to ensure that the software works nevertheless so what we often strive for in distributed systems is what is called as what is known as fault tolerance which means that even if some part of the system is faulty some part of the system is not working the system as a whole still continues providing the service to the users and so this is one of the main challenges in distributed systems how do we make things in such a way that they can tolerate faults in fact making things distributed and fault tolerant is so difficult that a

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| fault tolerance | /fˈɔlt tˈɑːlɚɹəns/ | The ability to continue working when part of a system fails. | Replication improves fault tolerance when a machine crashes. |
| faulty | /fˈɔlti/ | Not working correctly. | The monitor removed the faulty node from the pool. |
| independently | /ˌɪndᵻpˈɛndəntli/ | Separately, without being controlled by something else. | Each replica can fail independently of the others. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| be known as | Be called by a particular name. |
| make sure | Take action to ensure something happens. |

### 14:00–14:36 — Prefer simplicity when possible

lot of people who work professionally on distributed systems think that oh well if you can solve a problem on a single computer it's basically easy so if you can solve a problem on a single computer you'll probably have a much better time just keeping it on one computer not over complicating things not going into a distributed system setting and so all of the problems this pandora's box of problems that arise with distributed systems well we should try and open that only if we actually have to but as we said earlier there are lots of good reasons why you might have to open that box

#### Vocabulary

| Word or expression | IPA | Simple English meaning | Example |
| --- | --- | --- | --- |
| complexity | /kəmplˈɛksᵻɾi/ | The state of having many connected and difficult parts. | Adding retries increased the complexity of the protocol. |
| Pandora's box | /pændˈɔːɹəz bˈɑːks/ | A source of many unexpected and difficult problems. | Sharing mutable state opened a Pandora's box of race conditions. |
| sufficient | /səfˈɪʃənt/ | Enough for a particular purpose. | One acknowledgement is not sufficient when a quorum is required. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| only if | Only in the situation where a condition is true. |
| have to | Need to do something because it is necessary. |
