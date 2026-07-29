---
title: "[Transcript/Vocabulary] Distributed Systems 1.2: Computer networking"
date: 2026-07-29
categories: ["english-learning", "transcript", "networking"]
slug: "distributed-systems-1-2-computer-networking"
type: "post"
---

## Reference

Distributed Systems 1.2: Computer networking

https://www.youtube.com/watch?v=1F3DEq8ML1U&list=PLeKd45zvjcDFUEv_ohr_HdUFe97RItdiB

## Transcript

### 0:00–1:00 — Nodes and network types

section i will talk a bit more about the relationship between distributed systems and computer networking so in distributed systems generally any computing device that is involved in the system we call a node so a node could be a phone or a laptop or a server in a data center or any of the other things we talked about earlier and the fundamental abstraction of distributed systems the communication abstraction is that one node can send a message to another node that's it that's the entire basis of distributed system one node sends a message to another node and this captures all of the possible modes of communication that can happen now in practice of course there are lots of different types of network and different ways of getting a message from one node to another and so examples of that would be if you're at the university you will be probably using university provided wi-fi or college provided wi-fi uh if you're at home you probably have a home internet connection

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| node | A computer or device that participates in a network. |
| data center | A building that contains many computers and network equipment. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| be involved in | Take part in something. |

### 1:00–2:00 — Local and long-distance networks

uh if you're sitting in a coffee shop you will probably be using the wi-fi there if you're out and about in town you will probably be using some cellular data on your phone and that's only like the network that you connect to directly on top of the those there are the backbone networks in that form the internet and there are lots of different types of network operated by all sorts of different companies some of those go via cables copper cables some of them are fiber optic cables some of them go underneath the sea some of them go by a satellite and so on all sorts of ways of getting messages from a to b in addition they're all sorts of physical communication mechanisms such as electrical pulses on a wire uh radio waves or lasers going down fiber optic cables or even hard drives in a van what hard drives in a van that's not a network connection well i will argue this is also a mechanism from getting messages from a to b so if what

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| cellular data | Internet access provided through a mobile phone network. |
| connect directly | Join a network without another local network in between. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| out and about | Away from home and moving around in public places. |

### 2:00–3:00 — Moving large amounts of data

you have is a very large amount of data that you want to send to somebody else maybe to transfer it to a different data center then actually sending all of that data over the internet can be kind of slow and expensive and it can actually make more sense to load all of the data onto a bunch of hard drives load the box of hard drives into a van drive the van to the destination and when it gets to the destination you can then download all of the data back off the hard drives uh and store them in whatever system they need to be stored in and this people do this in practice actually and amazon web services for example which is a big provider of data center services they actually have this service where you can rent a box of hard drives from them and it will come as a in a career service and you can load all of your data onto it it takes about 50 terabytes or so on one of these boxes and send it back and so of course this is a very slow form of networking because it might take

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| transfer | Move data from one place or system to another. |
| bandwidth | The amount of data a network connection can carry in a period of time. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| make sense to | Be a reasonable choice for someone. |

### 3:00–4:00 — Bandwidth and latency

a day or a couple of days for the data to arrive but it is also quite a high bandwidth form of networking that is you can transfer large quantities of data and i would argue that from a distributed systems point of view this is just another messaging channel it's another way of getting a message from a to b distinction is just the latency and the bandwidth of those different networking channels so latency varies hugely depending on what sort of network you're looking at within the devices on your home wi-fi for example or within servers in the same data center you probably get like a millisecond maybe less than a millisecond depending on how congested the network is um latency that is the time that it takes to communicate from one device to another uh if you're going over the internet and you're talking to a server that is located on a different continent then it's probably more like on the order of 100 milliseconds of course hard drives in a van will

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| latency | The delay before data reaches its destination. |
| messaging channel | A way for two systems to send data to each other. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| from a ... point of view | When considered from a particular perspective. |

### 4:00–5:00 — Network characteristics

probably take a day or a couple of days but still you know it's just another networking channel in terms of bandwidth this very hugely like a 3g phone uh might have like a megabit per second if you've got a good signal it might be more like 100 kilobits per second if you've got a poor signal um home broadband might be like 10 megabits of course it varies very much how close you are to the the next provider whether you have fiber and so on um roughly estimating the bandwidth of hard drives in a van well if you take one of these boxes and it takes a couple of days to do the whole loading data onto it getting it to the other place getting the data back off it again you can probably estimate it at roughly being a gigabit per second or something like that uh if you use one box of course you can send multiple boxes in which case you can increase that number those are just very rough numbers but just sort of to give you an idea of the order of magnitude that we're talking about with these so

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| megabit per second | A unit for measuring data-transfer speed. |
| signal | A transmitted wave that carries information. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| vary hugely | Be very different across situations. |

### 5:00–6:00 — The web as a distributed system

i will now like to show you an example of one concrete distributed system which is a system that you use every day and that system is the web and so the web we can now analyze through a distributed systems lens and see what actually happens uh when you load a website in a web browser and so what happens there is that we have two communicating entities first of all you've got the client which is the web browser running on your computer or your phone and you've got the server which is usually located somewhere in a data center and when the client wants to display a web page it makes a request so a request is just a message that gets sent over the network and that request is targeted at a particular server and it contains the path of the url that you're trying to load so you notice in the url you have the http maybe s double slash then comes the server name

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| distributed systems lens | A way of examining something using distributed-systems ideas. |
| website | A collection of web pages under one address. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| every day | On each day; very regularly. |

### 6:00–7:00 — URLs and destinations

and then from the single slash onwards is the path and so the the bit before that first slash is uh the server name which is going to be the destination where we sent the message to and what follows after that is the path which is then contained within the message that we send to that destination and so that's message uh if you want to load a web page we call that a get request and it contains the path and the server then will respond with the contents of that web page and so that is probably an html page if it's just a plain web page but it could also be an image or it could be a video file it could be a pdf document or anything like that and so um what we have here is a simple protocol consisting of two messages a request from the client to the server and a response from the server back to the client containing the data that the client asked for so i'd like to now give you a little demo of what this actually looks like and so of course you know what a web

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| path | The part of a URL that identifies a resource on a server. |
| destination | The place where a message is sent. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| from ... onwards | Starting at a point and continuing after it. |

### 7:00–8:00 — Capturing web traffic

browser looks like here i've loaded the course web page and i can scroll up and down and i can now record the messages that are sent and received over the network using a network capture tool so here i'm going to use a tool that's called charles and i'm going to put it into recording mode it's going to start recording and then i'm going to go here and just hit reload on the website and so here we go we've loaded the page again and now go back to charles and we can see that we've now accumulated a whole bunch of requests so each line here is one request message that was made from the web browser to the server and it also contains the response that was sent back from the server to the client and so here we can see for example this the first request here was for this path here which is the the path on the web browser you can see here in the url that matches up with this path uh you can see it's a get request to load a particular website

#### Vocabulary

| Word or expression | Simple English meaning |
| --- | --- |
| network capture | A recording of data sent and received over a network. |
| Wireshark | A program used to inspect network traffic. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| scroll up and down | Move through a page vertically. |

### 8:00–9:00 — HTTP request headers

um you can see a bunch of information like the user agent here for example is essentially the version of the web browser that i'm using so it identifies the client software version here this accept header this is uh indicates what file types the web browser understands so it understands html and various other image formats and stuff like that then there's a whole bunch of other stuff here like how it what sort of compression it accepts what sort of language i speak and so on so all sorts of stuff here and what you see in this panel here is the request message and then in the lower panel here you see the response message and here the response message to this here contains some html um and you can see like the whole content of the html page i can scroll down it's a bit boring okay and we can have a look at other requests here as well so you can see this here this looks like it's a picture that it's downloading and etc here's some css some style files and so on

#### Vocabulary

| Word or expression | Simple English meaning |
| user agent | Information that identifies the browser or client making a request. |
| header | Extra information sent with a network request or response. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| for example | Used to introduce one possible case. |

### 9:00–10:00 — Request-response protocols

so what we have is this very simple request response messaging protocol at the conceptual level so at the conceptual level here uh at the distributed systems level we're just talking about one message one response now what happens at the underlying physical network level is a little bit more complicated and so uh we can look at what happens and the physical level by using a different network capture tool so i'm going to use a tool here that's called wireshark and this will this will actually capture rather than capturing at the http level capturing the request and response it's going to capture the individual network packets so let's see what happens here i'll start recording and then i'll go back to the web browser and i'll reload again and go back here and hit stop and here we now see oh a lot of activity again and so here in wireshark every line in this table

#### Vocabulary

| Word or expression | Simple English meaning |
| request-response | A pattern where one system asks for something and another replies. |
| conceptual level | A high-level way of thinking about a system. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| what we have is | Used to introduce a description of the current result. |

### 10:00–11:00 — Packets and IP addresses

is a single network packet and so here you can see that there's a packet sent from one ip address to another ip address so the 19192168 that is the device that is the ip address of my laptop on which i'm recording this right now this 128.2 etc that is the server that is the name of the web server um that of the computer lab website that i'm connecting to and so here you can see it's connecting using the tcp protocol don't worry too much about that you'll learn a lot more about tcp in the computer networking course but the bottom line of this is there's a lot of back and forth you can see and then here there's some encryption that happens because it's an https connection and you can see that here's the name of the website that i'm connecting to the server name that i'm connecting to and so on and so on the physical level what's happening here on the network is that we have all of these network packets going back and forth and

#### Vocabulary

| Word or expression | Simple English meaning |
| packet | A small unit of data sent across a network. |
| IP address | A number that identifies a device on an IP network. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| in this case | In this particular situation. |

### 11:00–12:00 — Packet size limits

the reason that we have lots of packets is that there's a maximum size of each packet and you can see here in this column it has the size the length in bytes of each packet and you can see that the length only goes up to about 1500 bytes here another with 1500 bytes but there are none that are bigger than that and that's because networks have this maximum size of a packet and so if you want to send a message that is greater than the size of a single packet you have to split it up into multiple packets and this is exactly what the tcp protocol does so the tcp http runs on top of tcp so http has this request message response message paradigm but a request might be bigger than a single network packet and a response is quite likely bigger than a single network packet as well so then http uses tcp underneath and tcp breaks down these big messages into small network packets that are small enough that the network can

#### Vocabulary

| Word or expression | Simple English meaning |
| maximum size | The largest allowed amount or measurement. |
| bytes | Units used to measure digital data. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| go up to | Reach as high as a particular number. |

### 12:00–13:00 — TCP reassembly

deliver them and then on the recipient side tcp puts all of the network packets back together again to give us one large chunk of bytes and so this is uh this is now like an important thing to keep in mind in distributed systems when we're talking about messages being sent and received we're not talking about individual packets because a message may well be bigger than a single network packet and so that message then has to be broken down into small network packets so the net the message is really a higher level conceptual um object that gets sent back and forth between between two nodes and how exactly this gets broken down to to the in on the packet level that's something that we leave to the computer networking people so for distributed systems point of view we can just assume that we have this mechanism through which we can send these requests and these responses here and we don't care too much about the details of how this is actually physically represented

#### Vocabulary

| Word or expression | Simple English meaning |
| TCP | A network protocol that reliably delivers ordered data. |
| recipient | A person or system that receives something. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| put ... back together | Reassemble separate parts into one whole. |

### 13:00–13:08 — Communication assumptions

in terms of network packets we just assume that we have this communication mechanism

#### Vocabulary

| Word or expression | Simple English meaning |
| communication mechanism | A method that systems use to exchange information. |
| assume | Accept something as true for the purpose of reasoning. |

#### Phrases

| Phrase | Meaning |
| --- | --- |
| keep in mind | Remember an important point. |
