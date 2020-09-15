---
layout: post
comments: false
title: "#1 스프링 웹플럭스 레퍼런스 (Web on Reactive Stack)"
date: 2020-09-15
image: '/assets/img/'
description: "Spring WebFlux 소개 및 기초"
main-class: dev
tags: spring java reactive
category: "spring"
introduction: "Spring WebFlux 소개 및 기초"
---
# #1 스프링 웹플럭스 레퍼런스 (Web on Reactive Stack)

## Web on Reactive Stack
이 문서는 Netty(이하 네티), Undertow(이하 언더토), 서블릿 3.1+ 컨테이너와 같은 논 블로킹 서버 위에 구동되는, [Reactive Streams(이하 리액티브 스트림)](https://www.reactive-streams.org) API 기반의 리액티브 스택 웹 어플리케이션 지원에 대해 다룬다. 각 챕터는 [Spring WebFlux(이하 스프링 웹플럭스)](#webflux) 프레임워크, 리액티브 [WebClient(이하 웹클라이언트)](#webflux-client), [테스팅](#webflux-test) 그리고 [리액티브 라이브러리](#webflux-reactive-libraries)를 주제로 한다. 서블릿-스택 웹 어플리케이션에 대해서는 [Web on Servlet Stack](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#spring-web)을 보라.  
  

## 1. 스프링 웹플럭스(Spring WebFlux)
스프링 프레임워크의 오리지널 웹 프레임워크인 스프링 웹 MVC는 서블릿 API와 서블릿 컨테이너를 위한 것이었다. 리액티브 스택 웹 프레임워크인 스프링 웹플럭스는 스프링 버전 5.0 이후로 추가되었다. 스프링 웹플럭스는 완전한 논 블로킹으로, [리액티브 스트림](https://www.reactive-streams.org) back pressure(이하 백프레셔)를 지원하며, 네티, 언더토, 서블릿 3.1+ 컨테이너 등등의 서버에서 구동된다.  
  
스프링 웹 MVC와 스프링 웹플럭스 각각은 스프링 프레임워크 안에서 대칭적으로 존재한다([spring-webmvc](https://github.com/spring-projects/spring-framework/tree/master/spring-webmvc), [spring-webflux](https://github.com/spring-projects/spring-framework/tree/master/spring-webflux) 모듈). 각 모듈은 선택적이며, 어플리케이션은 하나, 또는 다른 모듈, 또는 경우에 따라 둘 모두를 동시에 사용할 수 있다 - 예를 들어 스프링 MVC 컨트롤러와 리액티브 웹클라이언트를 함께 사용할 수 있다.  
  

## 1.1. 개요
스프링 웹플럭스는 왜 탄생했는가?  
  
이 물음에 대한 답 일부는, 논 블로킹 웹 스택이 적은 수의 쓰레드와 보다 적은 하드웨어 자원으로 동시성을 처리하기 위함이다. 서블릿 3.1 에서도 이미 논 블로킹 I/O를 다루기 위한 API를 제공하지만, 이 API를 사용하면 다른 나머지 서블릿 API와는 멀어지게 된다(필터, 서블릿과 같은 동기 방식 처리나 getParameter, getPart 등 블로킹 API). 이런 점이 어떠한 논 블로킹 런타임에서든 기반 역할로 지원하는 새로운 공통 API의 탄생 동기가 되었다. 네티와 같이 비동기, 논 블로킹 영역이 잘 구현된 서버로 인해 이 점은 중요하다.  
  
스프링 웹플럭스의 또다른 탄생 배경은 함수형 프로그래밍이다. 자바 8 에서 추가된, 함수형 API를 위한 람다 표현식은 자바 5 의 어노테이션(어노테이티드 REST 컨트롤러, 단위 테스트)만큼이나 자바 세계에 새로운 기회를 제공한다. 람다 표현식은 비동기 로직을 서술적 구성으로 작성 가능하도록 하는, 논 블로킹 어플리케이션과 continuation-style APIs(CompletableFuture 및 [ReactiveX](http://reactivex.io)로 보급된)를 위한 유용한 도구이다. 프로그래밍 모델 레벨에서, 자바 8 은 스프링 웹플럭스에서 함수형 웹 엔드포인트를 어노테이티드 컨트롤러와 함께 제공하는 일을 가능하게 한다.  
  

## 1.1.1. "리액티브" 의 정의(Define "Reactive")

위에서 "논 블로킹" 과 "함수형" 을 언급했다. 그런데 리액티브는 무슨 의미일까?  
  
용어 "리액티브" 는 변경에 대한 반응에 중점을 두어 만들어진 프로그래밍 모델을 가리킨다. 네트워크 컴포넌트는 I/O 이벤트에 반응하며, UI 컨트롤러는 마우스 등과 같은 이벤트에 반응한다. 이 맥락에서, 논 블로킹은 리액티브이다. 왜냐하면 동작을 중단(blocking)하는 대신 명령의 완료 또는 데이터의 제공 등의 알림에 반응하는 방식을 취하기 때문이다.  
  
스프링과 "리액티브" 의 연결과, 논 블로킹 백프레셔 기술에는 또다른 중요한 메커니즘이 있다. 동기 방식, 명령형 코드, 블로킹 호출은 요청자를 대기 상태로 두어 자연스럽게 백프레셔의 형태를 취한다. 논 블로킹 코드에서는 빠른 producer(이하 프로듀서)가 목적지(소비자)를 압도하지 않도록 하기 위해 이벤트의 속도를 제어하는 것이 중요하다.  
  
리액티브 스트림은 자바 9 에서 [채택된](https://docs.oracle.com/javase/9/docs/api/java/util/concurrent/Flow.html) [작은 스펙](https://github.com/reactive-streams/reactive-streams-jvm/blob/master/README.md#specification)이다. 리액티브 스트림은 백프레셔를 통해 비동기 컴포넌트들 사이의 비동기적 상호 작용을 정의한다. 예를 들어, 데이터 저장소([Publisher(이하 발행자)](https://www.reactive-streams.org/reactive-streams-1.0.1-javadoc/org/reactivestreams/Publisher.html) 역할)는 HTTP 서버([Subscriber(이하 구독자)](https://www.reactive-streams.org/reactive-streams-1.0.1-javadoc/org/reactivestreams/Subscriber.html))가 응답에 쓰기 위한 위한 데이터를 생성한다. 리액티브 스트림의 주안점은 구독자로 하여금 발행자가 데이터를 얼마나 빠르게, 혹은 얼마나 천천히 생성할지 제어할 수 있게 한다는 데에 있다.  
  
> 공통 질문: 발행자를 늦출 수 없으면 어떻게 되는가? 리액티브 스트림의 목적은 오직 그 메커니즘과 경계선을 확립하는 것이다. 발행자를 늦출 수 없다면 버퍼의 사용, 드랍 또는 실패 등을 결정해야 한다.  
  

## 1.1.2. 리액티브 API(Reactive API)

리액티브 스트림은 시스템의 상호 정보 교환에 있어 중요한 역할을 한다. 이는 라이브러리와 인프라스트럭처 컴포넌트에는 흥미로운 점이지만, 어플리케이션 API에는 상대적으로 유용하지 못하다. 왜냐하면 이는 너무 로우 레벨이기 때문이다. 어플리케이션은 비동기 로직을 작성하기 위해서 보다 고수준의, 풍부한 함수형 API를 필요로 한다. 자바 8 의 스트림 API와 유사하지만 컬렉션에 국한되지 않는다. 이것이 리액티브 라이브러리의 역할이다.  
  
[Reactor(이하 리액터)](https://github.com/reactor/reactor)는 스프링 웹플럭스가 채택한 리액티브 라이브러리이다. 리액터는 ReactiveX와 함께하는 [풍부한 연산자](http://reactivex.io/documentation/operators.html)를 통해 0..1(Mono) 와 0..N(Flux) 방식 API를 제공한다. 리액터는 리액티브 스트림 라이브러리다. 따라서 리액터의 연산자는 논 블로킹 백프레셔를 지원하며, 특히 서버 사이드 자바에 집중한다. 그리고 스프링과 긴밀하게 협업하여 개발되었다.  
  
웹플럭스는 리액터에 핵심적인 의존성을 가지지만, 리액티브 스트림을 통해 다른 리액티브 라이브러리들과도 상호 운용이 가능하다. 일반적으로 웹플럭스 API는 플레인 Publisher를 인풋으로 받고, 내부적으로 이를 리액터 타입으로 맞추어 적용하고, 사용하고, Flux 또는 Mono를 아웃풋으로 반환한다. 때문에 어떠한 Publisher든 인풋으로 전달하여 아웃풋에 대한 연산을 적용할 수 있지만, 또다른 리액티브 라이브러리 사용을 위해 아웃풋을 형식에 맞추어야 한다. 웹플럭스는 언제든지 필요에 따라서(어노테이티드 컨트롤러 등) RxJava 또는 다른 리액티브 라이브러리에 쉽게 적용될 수 있다. 이에 관한 더 자세한 내용은 [리액티브 라이브러리](#webflux-reactive-libraries)를 보라.  
  
> 리액티브 API에 더하여, 웹플럭스는 코틀린의 [Coroutines(이하 코루틴)](https://docs.spring.io/spring/docs/current/spring-framework-reference/languages.html#coroutines) API 와도 함께 사용될 수 있다. 코루틴은 보다 명령형의 프로그래밍을 제공한다. 앞으로의 코틀린 코드 샘플은 코루틴 API와 함께할 것이다.  
  

## 1.1.3. 프로그래밍 모델(Programming Models)

spring-web 모듈은 스프링 웹플럭스의 근간이 되는 리액티브의 기반을 포함하며, HTTP 추상화, 지원되는 서버를 위한 리액티브 스트림 [어댑터](#121-httphandler), [코덱](#125-코덱), 그리고 서블릿 API와 유사하면서 논 블로킹 계약을 포함하는 핵심 [WebHandler API](#122-webhandler-api)를 포함한다.  
  
이를 토대로 스프링 웹플럭스는 프로그래밍 모델에 있어 두 가지 선택지를 제공한다.  
  

*   [어노테이티드 컨트롤러](#annotated-controller): 스프링 MVC와 일치하며, spring-web 모듈과 동일한 어노테이션을 기반으로 구성되었다. 스프링 MVC와 웹플럭스 컨트롤러는 리액티브(리액터, RxJava) 반환 타입을 지원하며, 결과적으로 이 둘을 구분하기가 쉽지 않게 되었다. 주목할만한 차이점은 웹플럭스는 리액티브 @RequestBody 아규먼트를 지원한다는 것이다.
*   [함수형 엔드포인트](#functional-endpoints): 람다 기반의 경량 함수형 프로그래밍 모델. 소형 라이브러리, 혹은 요청을 라우팅하고 핸들링하기 위해 어플리케이션이 사용할 수 있는 유틸리티의 모음이라고 할 수 있다. 어노테이티드 컨트롤러와의 큰 차이점은, 어플리케이션이 요청 핸들링의 시작부터 끝까지 책임지느냐 vs 어노테이션을 통해 의사를 표시하고 콜백을 받느냐이다.

  

## 1.1.4. 적용 영역(Applicability)

스프링 MVC냐, 웹플럭스냐?  
  
이 질문은 자연스럽지만 적절하지 못한 이분법이라 할 수 있다. 실제로 이 둘은 사용 가능한 옵션의 범위를 확장하기 위해 함께 사용될 수 있다. 이 둘은 서로간의 지속성과 일관성을 지향하도록 설계되었다. 나란히 함께 사용될 수 있으며, 서로가 서로에게 응답과 이점을 주고 받을 수 있다. 아래 다이어그램은 이 둘이 어떻게 연관되어 있는지 보여준다. 둘이 공통적으로 지닌 것, 한 쪽만 지니고 있는 것을 보여준다.  
  
![spring mvc and webflux venn](https://docs.spring.io/spring/docs/current/spring-framework-reference/images/spring-mvc-and-webflux-venn.png)  
  
다음 사항에 주목하기 바란다:

*   잘 작동 중인 기존 스프링 MVC 어플리케이션이 있다면, 변경할 필요가 없다. 명령형 프로그래밍은 작성하고 이해하고 디버깅 하기에 가장 쉬운 방법이며, 라이브러리 선택에 있어 최대한의 선택지를 가지게 된다. 대부분 블로킹 방식이기 때문에.
*   이미 논 블로킹 웹 스택을 찾고 있다면, 스프링 웹플럭스는 다른 웹 스택과 동일한 실행 모델이라는 이점과 함께, 서버에 있어서의 선택지(네티, 톰캣, 제티, 언더토, 서블릿 3.1+ 컨테이너), 프로그래밍 모델에 있어서의 선택지(어노테이티드 컨트롤러, 함수형 웹 엔드포인트), 리액티브 라이브러리에 있어서의 선택지(리액터, RxJava 또는 그 외)를 제공한다.
*   자바 8 람다 또는 코틀린과 함께 사용할 경량 함수형 웹 프레임워크를 원한다면, 스프링 웹플럭스 함수형 웹 엔드포인트를 사용할 수 있다. 또한 더 작은 어플리케이션이나, 더 훌륭한 명료성과 제어(control)라는 이점을 보다 적은 복잡도로 제공하는 마이크로서비스에도 스프링 웹플럭스는 좋은 선택지가 된다.
*   마이크로서비스 아케텍처에서 스프링 MVC 또는 스프링 웹플럭스 컨트롤러 또는 스프링 웹플럭스 함수형 엔드포인트 각각으로 만들어진 서로 다른 어플리케이션을 혼합하여 사용할 수 있다. 이 두 프레임워크에가 동일한 어노테이션 기반 프로그래밍 모델을 지원한다는 점은 올바른 도구를 적재적소에 사용하는 동시에 기존 지식을 재사용하기 쉽게 만들어준다.
*   어플리케이션을 평가하는 간단한 방법은 어플리케이션의 의존성을 확인하는 것이다. 블로킹 영속성 API(JPA, JDBC) 또는 네트워킹 API를 사용하고 있다면, 스프링 MVC는 적어도 공통 아키텍처에 있어서는 최고의 선택이 된다. 스프링 MVC는 기술적으로 개별 쓰레드에 대해 리액터와 RxJava를 사용하여 블로킹 호출을 수행하는 것이 가능하지만, 논 블로킹 웹 스택을 최대한 활용하지는 못한다.
*   기존 스프링 MVC어플리케이션이 원격 서비스 호출(remoting)을 수행한다면, 리액티브 WebClient(이하 웹클라이언트)를 사용해보라. 스프링 MVC 컨트롤러 메서드로부터 리액티브 타입(Reactor, RxJava, [기타 등](#webflux-reactive-libraries))을 반환값으로 직접 얻을 수 있다. 호출 당, 혹은 호출 간 상호 작용의 지연이 클수록, 더욱 드라마틱한 이점을 얻을 수 있다. 스프링 MVC 컨트롤러는 다른 리액티브 컴포넌트를 똑같이 호출할 수 있다.
*   팀의 규모가 크다면, 논 블로킹, 함수형, 선언적 프로그래밍으로의 전환에 따르는 학습 곡선이 가파르다는 점을 유념해야 한다. 전체를 바꾸지 않고 시작하는 실용적인 방법은 리액티브 웹클라이언트를 사용하는 것이다. 이걸 넘어서면 작은 것부터 시작해보고, 이로부터 얻은 장점을 측정해보라. 대부분의 어플리케이션의 경우 이 전환이 필수적이지는 않다고 본다. 얻고자 하는 장점이 무엇인지 불확실하다면, 논 블로킹 I/O가 어떻게 작동하는지, 그리고 이것의 효과가 무엇인지 배우는 것에서 시작하도록 한다(예로, 싱글 쓰레드 Node.js의 동시성 처리가 있다).

  

## 1.1.5. 서버(Servers)

스프링 웹플럭스는 톰캣, 제티, 서블릿 3.1+ 컨테이너뿐만 아니라 네티, 언더토와 같은 논 서블릿 런타임에서도 지원된다. 다양한 서버에 고수준 [프로그래밍 모델](#webflux-programming-models)을 지원하기 위해, 모든 서버에는 로우 레벨 [공통 API](#121-httphandler)가 적용되어 있다.  
  
스프링 웹플럭스에는 서버를 시작하고 정지하기 위한 내장형 기능은 없다. 하지만 스프링 설정과 [웹플럭스 인프라스트럭처](#webflux-config2)로 어플리케이션을 [조립](#122-webhandler-api)하기란 어렵지 않은 일이다. 그리고 단 몇 줄의 코드만으로 이 어플리케이션을 [구동](#121-httphandler)할 수 있다.  
  
스프링 부트는 웹플럭스 스타터를 내장하고 있다. 웹플럭스 스타터는 이 과정을 자동화한다. 스타터는 기본 설정으로 네티를 사용하지만, 메이븐이나 그레들을 이용한 의존성 변경을 통해서 톰캣, 제티, 언더토 등 다른 서버를 사용하도록 쉽게 변경할 수 있다. 스프링 부트가 기본 설정으로 네티를 사용하는 이유는, 네티는 비동기, 논 블로킹 영역에서 폭넓게 사용되며 클라이언트과 서버가 자원을 공유하도록 하기 때문이다.  
  
톰캣과 제티는 스프링 MVC와 웹플럭스 모두와 함께 사용할 수 있다. 그러나 이 둘은 그 작동 방식이 매우 다르다는 점을 유의해야 한다. 스프링 MVC는 서블릿 블로킹 I/O에 기반을 두며, 필요에 따라 어플리케이션이 서블릿 API를 직접 사용하도록 한다. 스프링 웹플럭스는 서블릿 3.1 논 블로킹 I/O에 기반을 두며, 로우 레벨 어댑터 뒷단에서 서블릿 API를 사용하며 이를 직접적으로 노출하지 않는다.  
  
언더토의 경우 스프링 웹플럭스는 서블릿 API가 아닌 언더토 API를 직접 사용한다.  
  

## 1.1.6. 퍼포먼스(Performance)

퍼포먼스는 많은 의미를 내포하고 있다. 리액티브와 논 블로킹은 어플리케이션을 더 빠르게 만들어주지 않는다. 몇몇 경우에 한하여 더 빨라질 수는 있다(예로, 병렬로 웹클라이언트를 사용하여 원격 호출을 실행할 때). 대체로 논 블로킹 방식은 더 많은 작업량을 필요로 하며, 이는 요청 처리 시간을 약간 늘어나게 할 수 있다.  
  
리액티브와 논 블로킹을 사용할 때의 중요한 이점은 적고 고정된 수의 쓰레드와 보다 적은 메모리를 사용하도록 조정할 수 있는 능력에 있다. 이는 어플리케이션이 부하에 대해 더 탄력적으로 동작할 수 있도록 한다. 왜냐하면 보다 예측할 수 있는 방법으로 조정되기 때문이다. 하지만 이 스케일링을 관측하기 위해서는 약간의 지연을 필요로 한다(느리고 예측 불가능한 네트워크 I/O의 혼재로 인해). 여기서 리액티브 스택의 장점을 볼 수 있으며, 그 차이가 드라마틱하게 드러나는 지점이다.  
  

## 1.1.7. 동시성 모델(Concurrency Model)

스프링 MVC와 스프링 웹플럭스는 모두 어노테이티드 컨트롤러를 지원하지만, 동시성 모델 및 블로킹과 쓰레드에 대한 기본적인 상정에 중요한 차이가 있다.  
  
스프링 MVC(그리고 일반적인 서블릿 어플리케이션)에서는 어플리케이션은 현재 쓰레드가 블로킹될 것을 상정한다(예로, 원격 호출에 대하여). 그리고 이로 인하여 서블릿 컨테이너는 요청을 핸들링하는 동안 발생할 수 있는 잠재적인 블로킹에 대비하기 위해 큰 수의 쓰레드 풀을 사용하게 된다.  
  
스프링 웹플럭스(그리고 일반적인 논 블로킹 서버에서)에서는 어플리케이션은 쓰레드를 블로킹 하지 않을 것을 상정한다. 따라서 논 블로킹 서버는 적고 고정된 크기의 쓰레드 풀을 사용하여 요청을 처리한다(이벤트 루프 워커).  
  
> "스케일링" 과 "적은 수의 쓰레드" 는 모순으로 보일 수 있지만, 현재 쓰레드가 절대 블로킹되지 않는다는 것은 블로킹 호출을 받아들일 추가 쓰레드가 필요하지 않다는 의미가 된다.  
  
**블로킹 API 실행하기**
  
블로킹 라이브러리를 사용해야 한다면? 리액터와 RxJava는 publishOn 연산자를 제공하여 다른 쓰레드가 처리하도록 한다. 이는 쉬운 대안이 될 수 있지만 블로킹 API는 이 동시성 모델에 잘 어울리지 않음을 유념해야 한다.  
  
**가변 상태(Mutable State)**  
  
리액터와 RxJava에서는 연산자를 통해서 로직을 선언한다. 그리고 런타임에 데이터가 순차적으로, 뚜렷한 단계로 처리되는 곳에서 리액티브 파이프라인이 형성된다. 여기서의 중요한 이점은 어플리케이션이 가변 상태를 보호할 필요가 없다는 점이다. 왜냐하면 이 파이프라인 안의 어플리케이션 코드는 절대로 동시에 실행되지 않기 때문이다.  
  
**쓰레딩 모델**  
  
스프링 웹플럭스로 구동되는 서버에서는 어떤 쓰레드를 볼 수 있는가?

*   순수 스프링 웹플럭스 서버(예로, 데이터 접근이나 다른 선택적인 의존성이 존재하지 않는)에서는, 서버를 위한 쓰레드 하나, 요청을 처리하기 위한 쓰레드 여럿을 예상할 수 있다(보통 CPU 코어의 수가 쓰레드의 수가 된다). 그러나 서블릿 컨테이너의 경우, 서블릿 블로킹 I/O와 서블릿 3.1 논 블로킹 I/O를 모두 지원하기 위해 더 많은 수의 쓰레드가 사용될 수 있다(톰캣에서는 10개).
*   이벤트 루프 방식의 리액티브 웹클라이언트 연산자. 적고 고정된 수의 요청 처리 쓰레드가 사용된다(예로, 리액터 네티 커넥터와 사용되는 reactor-http-nio-). 리액터 네티가 클라이언트와 서버 모두에서 쓰인다면, 이 둘은 기본적으로 이벤트 루프 자원을 공유한다.
*   리액터와 RxJava는 Schedulers(이하 스케쥴러)라는 쓰레드 풀 추상화를 제공하여 publishOn 연산자와 함께 사용하며 다른 쓰레드 풀으로 처리를 전환한다. 스케쥴러는 특정한 동시성 전략을 제안한다. -예로, "parallel"(CPU 바운드 동작에는 제한된 수의 쓰레드 사용), 또는 "elastic"(I/O 바운드 동작에는 큰 수의 쓰레드 사용). 이러한 쓰레드를 본다는 것은 프로그램 코드가 특정 스케쥴러 전략을 사용하고 있음을 의미한다.
*   데이터 접근 라이브러리와 써드파티 의존성은 각자 스스로의 쓰레드를 생성하고 사용할 수 있다.

  
**설정하기**  
  
스프링 프레임워크는 [서버](#115-서버servers)를 시작하고 정지하는 기능을 제공하지 않는다. 서버의 쓰레딩 모델을 설정하기 위해서는 서버에 특화된 설정 API를 사용해야 한다. 스프링 부트를 사용한다면 스프링 부트의 서버 옵션을 확인하고, 웹클라이언트는 직접 [설정](#webflux-client-builder) 가능하다. 다른 라이브러리에 대해서는 각각의 레퍼런스 문서를 참조하도록 한다.  
  

## 1.2. 리액티브 코어(Reactive Core)

spring-web 모듈은 리액티브 웹 어플리케이션 지원을 위한 다음의 제반 사항을 포함한다:

*   서버의 요청 처리에 대해서는 두 가지 레벨의 지원이 있다.
    *   [HttpHandler](#121-httphandler): HTTP 요청 핸들링을 위한 논 블로킹 I/O와 리액티브 스트림 기반의 기본 핸들러. 리액터 네티, 언더토, 톰캣, 제티, 서블릿 3.1+ 컨테이너를 지원하는 어댑터와 함께 작동한다.
    *   [WebHandler API](#122-webhandler-api): 요청 처리를 위한 좀 더 고수준의, 다용도 웹 API. 어노테이티드 컨트롤러와 함수형 엔드포인트와 같은 구체적인 프로그래밍 모델 위에 존재한다.
*   클라이언트 사이드에는 논 블로킹 I/O, 리액티브 스트림 백프레셔로 HTTP 요청을 수행하기 위한 기본 ClientHttpConnector 계약이 있다. [리액터 네티](https://github.com/reactor/webflux-client-builder-reactor) 및 리액티브 [제티 HttpClient](https://github.com/jetty-project/jetty-reactive-httpclient)를 위한 어댑터를 사용해 작동한다. 여기에는 더 고수준의 [웹클라이언트](#webflux-client)가 사용된다.
*   클라이언트와 서버는 HTTP 요청과 응답 컨텐츠를 시리얼라이징/디시리얼라이징하기 위해 [코덱](#125-코덱)을 사용한다.

  

## 1.2.1. HttpHandler

[HttpHandler](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/http/server/reactive/HttpHandler.html)는 요청과 응답을 처리하는 싱글 메서드를 가진 단순한 계약이다. 의도적으로 작게 설계되었으며, 이것의 목적은 오로지 각기 다른 HTTP 서버 API에 대응하는 최소형의 추상화이다.  
  
다음 테이블은 지원되는 서버 API에 대해 기술한다:  
  
| 서버                                                                    | 사용되는 서버 API                                                           | 리액티브 스트림 지원                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 네티                                                                    | 네티 API                                                                | [리액터 네티](<https://github.com/reactor/webflux-client-builder-reactor>) |
| 언더토                                                                   | 언더토 API                                                               | spring-web: 언더토 to 리액티브 스트림 브릿지                                       |
| 톰캣                                                                    | 서블릿3.1 논 블로킹 I/O; byte[]에 대응하여 ByteBuffer를 읽고 쓰는 톰캣 API               | spring-web: 서블릿3.1 논 블로킹 I/O to 리액티브 스트림 브릿지                          |
| 제티                                                                    | 서블릿3.1 논 블로킹 I/O; byte[]에 대응하여 ByteBuffer를 읽고 쓰는 제티 API               | spring-web: 서블릿3.1 논 블로킹 I/O to 리액티브 스트림 브릿지                          |
| 서블릿3.1 컨테이너                                                           | 서블릿3.1 논 블로킹 I/O                                                      | spring-web: 서블릿3.1 논 블로킹 I/O to 리액티브 스트림 브릿지                          |

  
다음 테이블은 서버 의존성에 대해 기술한다([지원되는 버전](https://github.com/spring-projects/spring-framework/wiki/What%27s-New-in-the-Spring-Framework)):  
  
| 서버                          | 그룹                          | 아티팩트                        |
| --------------------------- | --------------------------- | --------------------------- |
| 리액터 네티                      | io.projectreactor.netty     | reactor-netty               |
| 언더토                         | io.undertow                 | undertow-core               |
| 톰캣                          | org.apache.tomcat.embed     | tomcat-embed-core           |
| 제티                          | org.eclipse.jetty           | jetty-server, jetty-servlet |
  
아래 코드 스니펫은 각 서버 API로 HttpHandler 어댑터를 사용하는 예제이다:  
  
리액터 네티  
  

Java

```java
HttpHandler handler = ...
ReactorHttpHandlerAdapter adapter = new ReactorHttpHandlerAdapter(handler);
HttpServer.create().host(host).port(port).handle(adapter).bind().block();
```

Kotlin

```kotlin
val handler: HttpHandler = ...
val adapter = ReactorHttpHandlerAdapter(handler)
HttpServer.create().host(host).port(port).handle(adapter).bind().block()
```

  
언더토  
  

Java

```java
HttpHandler handler = ...
UndertowHttpHandlerAdapter adapter = new UndertowHttpHandlerAdapter(handler);
Undertow server = Undertow.builder().addHttpListener(port, host).setHandler(adapter).build();
server.start();
```

Kotlin

```kotlin
val handler: HttpHandler = ...
val adapter = UndertowHttpHandlerAdapter(handler)
val server = Undertow.builder().addHttpListener(port, host).setHandler(adapter).build()
server.start()
```

  
톰캣  
  

Java

```java
HttpHandler handler = ...
Servlet servlet = new TomcatHttpHandlerAdapter(handler);

Tomcat server = new Tomcat();
File base = new File(System.getProperty("java.io.tmpdir"));
Context rootContext = server.addContext("", base.getAbsolutePath());
Tomcat.addServlet(rootContext, "main", servlet);
rootContext.addServletMappingDecoded("/", "main");
server.setHost(host);
server.setPort(port);
server.start();
```

Kotlin

```kotlin
val handler: HttpHandler = ...
val servlet = TomcatHttpHandlerAdapter(handler)

val server = Tomcat()
val base = File(System.getProperty("java.io.tmpdir"))
val rootContext = server.addContext("", base.absolutePath)
Tomcat.addServlet(rootContext, "main", servlet)
rootContext.addServletMappingDecoded("/", "main")
server.host = host
server.setPort(port)
server.start()
```

  
제티  
  

Java

```java
HttpHandler handler = ...
Servlet servlet = new JettyHttpHandlerAdapter(handler);

Server server = new Server();
ServletContextHandler contextHandler = new ServletContextHandler(server, "");
contextHandler.addServlet(new ServletHolder(servlet), "/");
contextHandler.start();

ServerConnector connector = new ServerConnector(server);
connector.setHost(host);
connector.setPort(port);
server.addConnector(connector);
server.start();
```

Kotlin

```kotlin
val handler: HttpHandler = ...
val servlet = JettyHttpHandlerAdapter(handler)

val server = Server()
val contextHandler = ServletContextHandler(server, "")
contextHandler.addServlet(ServletHolder(servlet), "/")
contextHandler.start();

val connector = ServerConnector(server)
connector.host = host
connector.port = port
server.addConnector(connector)
server.start()
```

  
서블릿 3.1+ 컨테이너  
  
어플리케이션을 WAR로 서블릿 3.1+ 컨테이너에 배포하려면 [AbstractReactiveWebInitializer](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/server/adapter/AbstractReactiveWebInitializer.html)를 확장하여 WAR 안에 포함해야 한다. 이 클래스는 HttpHandler를 ServletHttpHandlerAdapter로 래핑하고 이를 서블릿으로 등록한다.  
  

## 1.2.2. WebHandler API

다수의 [WebExceptionHandler](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/server/WebExceptionHandler.html) 및 [WebFilter](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/server/WebFilter.html), 단일 [WebHandler](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/server/WebHandler.html) 컴포넌트를 통해 요청을 처리하는 다목적 웹 API 제공을 위해, org.springframework.web.server 패키지는 HttpHandler를 기반으로 한다. 이 컴포넌트들은 스프링 ApplicationContext로 참조되어 WebHttpHandlerBuilder와 함께 [자동으로 감지](#131-스페셜-빈-타입)되거나 등록되어 사용된다.  
  
HttpHandler의 목적은 서로 다른 HTTP 서버에서의 사용을 위한 추상화에 있기에, WebHandler API는 웹 어플리케이션에서 일반적으로 사용되는 기능들보다 더 많은 기능을 제공한다. 웹 어플리케이션에서 일반적으로 사용되는 기능들은 다음과 같다:

*   사용자 세션(세션 어트리뷰트)
*   리퀘스트 어트리뷰트
*   요청에 대한 리졸빙된 Locale or Principal
*   파싱되고 캐싱된 폼 데이터 접근
*   멀티파트 데이터 추상화
*   기타 등등..

  

#### 스페셜 빈 타입

  
아래 테이블은 스프링 ApplicationContext에서 자동으로 감지되는, 혹은 직접 등록되는, WebHttpHandlerBuilder가 참조하는 컴포넌트 목록이다:  
  
| 빈 이름 | 빈 타입 | 카운트 | 설명 |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| \<any> | WebExceptionHandler | 0\..N | WebFilter 인스턴스들과 타겟 WebHandler에서 발생한 익셉션에 대한 핸들링을 제공한다. 자세한 내용은 [Exceptions](<#webflux-exception-handler>)를 참조한다. |
| \<any> | WebFilter | 0\..N | 인터셉터 스타일 로직을 적용하여 타겟 WebHandler의 전/후 동작을 담당한다. 자세한 내용은 [Filters](<#webflux-filters>)를 참조한다. |
| webHandler | WebHandler | 1 | 요청을 처리한다. |
| webSessionManager | WebSessionManager | 0\..N | ServerWebExchange의 메서드를 통해 노출된 WebSession 인스턴스를 관리한다. 디폴트는 DefaultWebSessionManager. |
| serverCodecConfigurer | ServerCodecConfigurer | 0\..1 | HttpMessageReader로 접근하여 ServerWebExchange의 메서드를 통해 노출된 폼 데이터와 멀티파트 데이터를 파싱하는 컴포넌트. 디폴트는 ServerCodecConfiguter.create() |
| localeContextResolver | LocaleContextResolver | 0\..1 | ServerWebExchange의 메서드를 통해 노출된 LocaleContext에 대한 리졸버. 디폴트는 AcceptHeaderLocaleContextResolver.                   |
| forwardedHeaderTransformer                                                           | ForwardedHeaderTransformer                                                           | 0\..1 | 포워드 타입 헤더를 처리하기 위한 컴포넌트. 각 헤더는 추출과 제거 or 제거 only. 디폴트는 사용하지 않음.                      |



#### 폼 데이터

  
ServerWebExchange는 폼 데이터로의 접근을 위해 다음 메서드를 노출한다.  
  

Java

```java
Mono<MultiValueMap<String, String>> getFormData();
```

Kotlin

```Kotlin
suspend fun getFormData(): MultiValueMap<String, String>
```

  
DefaultServerWebExchange는 설정된 HttpMessageReader를 사용하여 폼 데이터(application/x-www-form-urlencoded)를 MultiValueMap으로 파싱한다. 디폴트로 FormHttpMessageReader가 설정되어 ServerCodecConfigurer 빈이 이를 사용한다(Web Handler API를 보라).  
  

#### 멀티파트 데이터

  
ServerWebExchange는 멀티파트 데이터로의 접근을 위해 다음 메서드를 노출한다.  
  

Java

```java
Mono<MultiValueMap<String, Part>> getMultipartData();
```

Kotlin

```Kotlin
suspend fun getMultipartData(): MultiValueMap<String, Part>
```

  
DefaultServerWebExchange는 설정된 HttpMessageReader<MultiValueMap<String, Part>>를 사용하여 multipart/form-data 내용을 MultiValueMap으로 파싱한다. 현재는 [동기식 NIO 멀티파트](https://github.com/synchronoss/nio-multipart)가 유일하게 지원되는 써드파티 라이브러리이며, 멀티파트 요청을 논 블로킹으로 파싱한다. ServerCodeConfigurer 빈을 통해 활성화된다([Web Handler API](#122-webhandler-api) 참조).  
  
멀티파트 데이터를 스트리밍 방식으로 파싱하기 위해서는 HttpMessageReader가 반환하는 Flux<Part>를 사용한다. 예를 들어, 어노테이티드 컨트롤러에서 @RequestPart를 사용함은 Map 방식의, name을 사용한 개별 파트로의 접근을 암시한다. 따라서 이는 멀티파트 데이터 전체를 파싱해야 한다. 반면 @RequestBody를 사용하면 데이터를 MultiValueMap으로 모으지 않고 Flux<Part>로 디코딩할 수 있다.  
  

#### 포워디드 헤더(Forwareded Headers)

  
사용자 요청이 프록시를 통해 전송되면(예: 로드밸런서), 호스트, 포트, 스킴이 변경될 수 있고, 이는 클라이언트의 관점에서 정확한 호스트, 포트, 스킴으로의 링크를 생성하는 일을 방해한다.  
  
[RFC 7239](https://tools.ietf.org/html/rfc7239)는 Forwarded(이하 포워디드) HTTP 헤더를 정의한다. 이 헤더는 프록시가 원 요청 정보를 제공하기 위해 사용할 수 있다. 그리고 같은 목적으로 사용 가능한 X-Forwarded-Host, X-Forwarded-Port, X-Forwarded-Proto, X-Forwarded-Ssl, X-Forwarded-Prefix와 같은 비표준 헤더들이도 있다.  
  
ForwardedHeaderTransformer는 포워디드 헤더를 기반으로 요청의 호스트, 포트, 스킴을 변경하고 제거하는 컴포넌트이다. forwardedHeaderTransformer 빈으로 등록하면 [감지되어](#131-스페셜-빈-타입) 사용된다.  
  
어플리케이션은 헤더가 프록시 혹은 악의적인 클라이언트에 의해 의도적으로 추가된 것인지 알 수 없기 때문에, 여기에 대한 보안 고려사항이 있다. 이것이 프록시가 신뢰의 경계에서 외부로부터 전송된 신뢰할 수 없는 트래픽을 제거하도록 설정되어야 하는 이유이다. ForwardedHeaderTransformer로 removeOnly=true 설정을 함으로써 헤더를 사용하지 않고 제거할 수 있다.  
  
> ForwardedHeaderFilter는 버전 5.1 에서 deprecated 되면서 ForwardedHeaderTransformer로 대체되었다. 때문에 포워디드 헤더는 exchange의 생성 전에 먼저 처리될 수 있다. 필터가 설정되어 있다면 필터는 필터 목록에서 빠지고 대신 ForwardedHeaderTransformer가 사용된다.  
  

## 1.2.3. 필터

[WebHandler API](#122-webhandler-api)에서는 WebFilter를 사용하여 WebHandler의 전/후처리 로직을 필터 체이닝 방식으로 적용할 수 있다. [WebFlux Config](#111-웹플럭스-설정webflux-config)를 사용하면 WebFilter를 등록하는 일은 스프링 빈을 등록하는 일만큼 간단하다. 그리고 빈 선언부에 @Order를 사용하거나 Ordered인터페이스를 구현하여 우선순위를 설정할 수 있다.  
  

#### CORS

  
스프링 웹플럭스는 컨트롤러의 어노테이션을 통해 CORS설정을 잘 지원하기 위한 도구를 제공한다. 그러나 스프링 시큐리티와 함께 사용할 때는 내장된 CorsFilter를 사용할 것을 권한다. 이 필터는 반드시 스프링 시큐리티의 필터 체인보다 앞단에 적용되어야 한다.  
  
더 자세한 정보는 [CORS](#17-cors)와 [CORS WebFilter](#175-cors-webfilter)를 보라.  
  

## 1.2.4. 익셉션(Exceptions)

[WebHandler API](#122-webhandler-api)에서는 WebExceptionHandler를 사용하여 WebFilter와 WebHandler에서 발생한 익셉션을 처리할 수 있다. [WebFlux Config](#111-웹플럭스-설정webflux-config)를 사용하면 WebExceptionHandler를 등록하는 일은 스프링 빈을 등록하는 일만큼 간단하다. 그리고 빈 선언부에 @Order를 사용하거나 Ordered인터페이스를 구현하여 우선순위를 설정할 수 있다.  
  
다음 테이블은 사용할 수 있는 WebExceptionHandler구현체에 대해 기술한다:  
  
| 익셉션 핸들러                                                                                                                                 | 설명                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| ResponseStatusExceptionHandler                                                                                                          | ResponseStatusException 타입 익셉션을 처리한다. 익셉션에 있는 HTTP 상태 코드를 응답에 세팅한다.                                                                     |
| WebFluxResponseStatusExceptionHandler                                                                                                   | ResponseStatusExceptionHandler의 확장판. 익셉션 타입에 상관없이 @ResponseStatus의 HTTP 상태 코드를 결정한다. 이 핸들러는 [WebFlux Config](<#111-웹플럭스-설정webflux-config>)에서 선언한다. |

## 1.2.5. 코덱

spring-web과 spring-core 모듈은 리액티브 스트림 백프레셔와 논 블로킹 I/O를 통해서 바이트 컨텐츠와 고수준 객체 사이의 시리얼라이징/디시리얼라이징을 지원한다.  
  

*   [Encoder](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/core/codec/Encoder.html) 및 [Decoder](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/core/codec/Decoder.html)는 HTTP와 독립적으로 콘텐츠를 인코딩/디코딩하기 위한 클래스이다.
*   [HttpMessageReader](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/http/codec/HttpMessageReader.html)와 [HttpMessageWriter](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/http/codec/HttpMessageWriter.html)는 HTTP 메시지 콘텐츠를 인코딩/디코딩하기 위한 클래스이다.
*   EncoderHttpMessageWriter는 Encoder를 래핑하여 웹 어플리케이션에 사용하고, 같은 이유로 DecoderHttpMessageReader는 Decoder를 래핑한다.
*   [DataBuffer](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/core/io/buffer/DataBuffer.html)는 서로 다른 바이트버퍼들을 추상화한다.(네티의 ByteBuf, java.nio.ByteBuffer, 기타 등등) 그리고 모든 코덱은 여기서 작동한다. 이에 대해서는 "스프링 코어" 섹션의 [Data Buffers and Codecs](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#databuffers)에서 더 알아볼 수 있다.

  
spring-core 모듈은 byte\[\], ByteBuffer, DataBuffer, Resource, String 인코더와 디코더 구현체를 제공한다. spring-web 모듈은 Jackson JSON, Jackson Smile, JAXB2, Protocol Buffers 그리고 기타 다른 인코더와 디코더를 제공한다. 이 인코더와 디코더는 폼 데이터, 멀티파트 컨텐츠, 서버 전송 이벤트 및 기타 웹 요청 처리를 위한 웹 전용 HTTP 메시지 reader와 writer 구현체와 함께한다.  
  
ClientCodecConfigurer와 ServerCodecConfigurer는 어플리케이션에서의 코덱 사용 설정 및 커스터마이징을 위해 일반적으로 사용되는 클래스이다. 이 설정에 대해서는 [HTTP message codecs](#http-message-codecs)에서 다룬다.  
  

#### Jackson JSON

  
Jackson(이하 잭슨)라이브러리가 존재할 경우 JSON 과 바이너리 JSON([Smile](https://github.com/FasterXML/smile-format-specification)) 이 지원된다.  
  
Jackson2Decoder는 다음과 같이 동작한다:

*   잭슨의 비동기, 논 블로킹 파서는 바이트 청크 스트림을 각각 JSON 객체를 나타내는 TokenBuffer로 종합하기 위해 사용된다.
*   단일 값 퍼블리셔(Mono)를 디코딩하는 경우, 하나의 TokenBuffer가 존재한다.
*   다수 값 퍼블리셔(Flux)를 디코딩하는 경우, 각 TokenBuffer는 완전하게 포맷팅된 객체가 되기 충분한 바이트를 받은 시점에 ObjectMapper에게 전달된다. 인풋 컨텐츠는 JSON 배열이 될 수 있고, 컨텐츠 타입이 "application/stream+json"인 경우 [line-delimited JSON](https://en.wikipedia.org/wiki/JSON_streaming)이 될 수 있다.
*   SSE의 경우 Jackson2Encoder는 이벤트마다 실행되며 그 아웃풋은 지연 없이 플러싱된다.

  
Jackson2Encoder는 다음과 같이 동작한다:

*   단일 값 퍼블리셔(Mono)의 경우, 이를 간단히 ObjectMapper로 시리얼라이징한다.
*   다수 값 "application/json" 퍼블리셔의 경우, 기본적으로 값들을 Flux#collectToList() 로 모은 뒤 그 결과를 시리얼라이징한다.
*   다수 값 스트리밍 미디어 타입(예로, application/stream+json 또는 appliction/stream+x-jackson-smile) 퍼블리셔의 경우, [line-delimited JSON](https://en.wikipedia.org/wiki/JSON_streaming) 포맷을 사용하여 각 값을 독립적으로 인코딩하고, 쓰고, 플러싱한다.
*   SSE의 경우 Jackson2Encoder는 이벤트마다 실행되며 그 아웃풋은 지연 없이 플러싱된다.

> Jackson2Encoder와 Jackson2Decoder는 기본적으로 String 타입 요소를 지원하지 않는다. 대신 시리얼라이징된 JSON 컨텐츠는 한 문자 혹은 일련의 문자로 구성되어 있을 것을 상정하여 CharSequenceEncoder로 렌더링한다. Flux<String>으로 JSON 배열을 렌더링해야 한다면, Flux#collectToList()를 사용하고 Mono<List<String>>를 인코딩하라.  
  

#### 폼 데이터

  
"application/x-www-form-urlencoded" 컨텐츠의 인코딩 및 디코딩은 FormHttpMessageReader와 FormHttpMessageWriter가 처리한다.  
  
다양한 곳으로부터의 폼 컨텐츠 접근이 자주 이루어지는 서버에서는 ServerWebExchange가 제공하는 getFormData() 메서드로 컨텐츠를 파싱한다. 이 파싱 작업은 FormHttpMessageReader를 통해 이루어지며, 반복되는 접근을 위해 파싱 결과를 캐싱한다. [WebHandler API](#122-webhandler-api) 섹션의 Form Data를 보라.  
  
getFormData() 가 한 번 호출되면, 요청 본문에서 원본 컨텐츠는 더이상 읽을 수 없다. 이런 이유로 어플리케이션은 요청 본문에서 원본 컨텐츠를 읽는 대신 ServerWebExchange를 통해 캐싱된 폼 데이터로 접근하도록 한다.  
  

#### 멀티파트

  
"multipart/form-data" 컨텐츠의 인코딩 및 디코딩은 MultipartHttpMessageReader와 MultipartHttpMessageWriter가 처리한다. 결국 MultipartHttpMessageReader는 Flux<Part> 로의 실제 파싱 작업은 HttpMessageReader에게 위임하고, 간단히 그 결과를 MultiValueMap으로 모으기만 한다. 현재는 [동기식 NIO 멀티파트](https://github.com/synchronoss/nio-multipart)가 실제 파싱에 사용된다.  
  
다양한 곳으로부터의 멀티파트 컨텐츠 접근이 자주 이루어지는 서버에서는 ServerWebExchange가 제공하는 getMultipartData() 메서드로 컨텐츠를 파싱한다. 이 파싱 작업은 MultipartHttpMessageReader를 통해 이루어지며, 반복되는 접근을 위해 파싱 결과를 캐싱한다. [WebHandler API](#122-webhandler-api) 섹션의 Multipart Data를 보라.  
  
getMultipartData() 가 한 번 호출되면, 요청 본문에서 원본 컨텐츠는 더이상 읽을 수 없다. 이런 이유로 어플리케이션은 반복적인 파트에의 맵 방식 접근에 대해서 getMultipartData()를 지속적으로 호출해야 하고, Flux<Part> 로의 한 번의 접근에 대해서는 SynchronossPartHttpMessageReader를 사용한다.  
  

#### 제한

  
Decoder와 HttpMessageReader 구현체는 인풋스트림을 버퍼링한다. 설정을 통해 메모리의 버퍼 바이트 사이즈의 최대치를 지정할 수 있다. 인풋 버퍼링이 발생할 수 있는 몇 가지 경우가 있다. 예를 들어 @RequestBody byte\[\] 나 x-www-form-urlencoded 데이터 및 기타 등등의 방식으로 데이터를 다루는 컨트롤러 메서드와 같이 인풋이 합쳐지고 하나의 객체로 나타나는 경우 버퍼링이 발생한다. 또한 스트리밍에서 인풋스트림을 분리할 때 버퍼링은 발생할 수 있다. 예를 들어 제한되지 않은 텍스트, JSON 객체 스트림 및 기타 등등의 경우가 있다. 이런 스트리밍의 경우 버퍼 바이트 사이즈 제한은 스트림 안의 하나의 객체에 연관되어 적용된다.  
  
버퍼 사이즈를 설정하기 위해서는, 주어진 Decoder 또는 HttpMessageReader의 maxInMemorySize 프로퍼티 설정이 가능한지 확인하고, 가능하다면 관련 자바독에 기본값에 대한 상세 정보가 있을 것이다. 웹플럭스에는 ServerCodecConfigurer가 기본 코덱의 maxInMemorySize 프로퍼티를 통해 모든 코덱을 설정할 수 있는 [단일한 위치](#http-message-codecs)를 제공한다. 클라이언트 단에서는 [WebClientBuilder](#webflux-client-builder-maxinmemorysize)로 이 사이즈 제한을 변경할 수 있다.  
  
maxInMemorySize 프로퍼티는 [멀티파트 파싱](#125-코덱-multipart)에 적용되는 non-file 파트의 사이즈를 제한한다. 파일 파트에서는 디스크에의 파일 쓰기(writing) 작업의 임계치가 된다. 이 쓰기 작업에는 추가적으로 maxDiskUsagePerPart 프로퍼티가 있다. 이 프로퍼티는 파트 당 디스크의 크기에 대한 제한을 설정한다. 또, maxParts 프로퍼티는 하나의 멀티파트 요청의 전체 사이즈에 대한 제한을 설정한다. 웹플럭스에서 이 3 가지 프로퍼티를 모두 설정하려면 미리 설정된 MultipartHttpMessageReader 인스턴스를 ServerCodecConfigurer에게 설정해야 한다.  
  

#### 스트리밍

  
text/event-stream, application/stream+json 과 같은, HTTP 응답 스트리밍 시에는 연결이 끊어진 클라이언트를 가능한 빠르게 감지하기 위해 데이터를 주기적으로 전송하는 것이 중요하다. 이 한 번의 전송에는 코멘드만 담길 수도 있고, 비어 있는 SSE 이벤트가 될 수도 있다. 아니면 다른 어떤한 "무동작 명령(no-op)" 데이터든 가능하다. 이 데이터는 서버의 신호(heartbeat) 역할을 한다.  
  

#### DataBuffer

  
DataBuffer는 웹플럭스의 바이트버퍼이다. 스프링 코어의 [데이터 버퍼와 코덱](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#databuffers)에서 이에 관한 더 많은 정보를 얻을 수 있다. 여기서 핵심이 되는 부분은, 네티와 같은 서버에서는 바이트버퍼는 풀(pool)으로 관리되며, 참조는 카운팅된다. 그리고 소비(consume) 후에는 반드시 릴리즈하여 메모리 릭을 방지해야 한다.  
  
데이터 버퍼를 직접 소비하거나 생성하지 않는 이상, 혹은 커스텀 코덱을 만들어 사용하지 않는 한, 아니면 반대로 더 고수준 객체들로의/로부터의 컨버팅 작업에 코덱을 사용하는 한은, 일반적으로 웹플럭스 어플리케이션은 이런 이슈로부터 자유롭다. 이런 경우에 대해서는 [데이터 버퍼와 코덱](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#databuffers)를 다시 한 번 보길 바란다. 특히 [DataBuffer 사용하기](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#databuffers-using) 섹션을 권한다.  
  

## 1.2.6. 로깅

스프링 웹플럭스에서 DEBUG 레벨 로깅은 가볍게, 최소한으로, 사람에게 친화적으로 작성된다. 특정 문제를 디버깅할때만 유용한 다른 정보에 비해서 지속적으로 유용한 가치있는 정보에 중점을 둔다.  
  
TRACE 레벨 로깅은 일반적으로 DEBUG와 같은 원칙을 따르지만, 어떠한 디버깅에도 쓰일 수 있다. 그리고 어떤 로그 메시지들은 TRACE와 DEBUG 레벨에 대해 각기 다른 수준의 디테일을 보인다.  
  
좋은 로깅이란 로그 사용 경험으로부터 나온다. 로깅에 있어 위에 공언된 목표에 부합하지 않는 것이 보이면 알려주기 바란다.  
  

#### Log Id
웹플럭스에서는 하나의 요청을 처리하는 데에 다수의 쓰레드가 작동할 수 있기에, 특정 요청에 대한 로그 메시지들간의 연관성을 찾는 데에 있어 쓰레드ID는 유용하지 못하다. 이런 이유로 웹플럭스 로그 메시지는 기본적으로 요청 전용ID를 접두어로 둔다.  
  
서버 측에서는 로그ID는 ServerWebExchange의 어트리뷰트([LOG\_ID\_ATTRIBUTE](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/server/ServerWebExchange.html#LOG_ID_ATTRIBUTE)) 로 저장된다. ServerWebExchange.getLogPrefix()를 통해 완전히 포맷팅된 ID를 얻을 수 있다. WebClient 측에서는 로그ID는 ClientRequest의 어트리뷰트([LOG\_ID\_ATTRIBUTE](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/server/ServerWebExchange.html#LOG_ID_ATTRIBUTE))로 저장된다. ClientRequest.logPrefix()를 통해 완전히 포맷팅된 ID를 얻을 수 있다.  
  

**민감한 데이터**
DEBUG와 TRACE 로깅은 민감한 정보를 남길 수 있다. 때문에 폼 파라미터와 헤더는 기본적으로 마스킹되어야 하며, 전체 로깅 활성화는 명시적으로 이루어져야 한다.  
  
다음 예제는 서버측 요청에 대한 상세 로그 설정 코드이다:  
  

Java

```java
@Configuration
@EnableWebFlux
class MyConfig implements WebFluxConfigurer {

    @Override
    public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
        configurer.defaultCodecs().enableLoggingRequestDetails(true);
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class MyConfig : WebFluxConfigurer {

    override fun configureHttpMessageCodecs(configurer: ServerCodecConfigurer) {
        configurer.defaultCodecs().enableLoggingRequestDetails(true)
    }
}
```

  
다음 예제는 클라이언트측 요청에 대한 상세 로그 설정 코드이다:  
  

Java

```java
Consumer<ClientCodecConfigurer> consumer = configurer ->
        configurer.defaultCodecs().enableLoggingRequestDetails(true);

WebClient webClient = WebClient.builder()
        .exchangeStrategies(strategies -> strategies.codecs(consumer))
        .build();
```

Kotlin

```kotlin
val consumer: (ClientCodecConfigurer) -> Unit  = { configurer -> configurer.defaultCodecs().enableLoggingRequestDetails(true) }

val webClient = WebClient.builder()
        .exchangeStrategies({ strategies -> strategies.codecs(consumer) })
        .build()
```

  

#### 커스텀 코덱

  
지원되는 미디어타입을 추가하거나 기본 코덱에서 지원되지 않는 동작을 지원하기 위해 어플리케이션에 커스텀 코덱을 등록할 수 있다.  
  
개발자가 조정 가능한 몇가지 설정 옵션은 기본 코덱에 적용된다. 커스텀 코덱은 [버퍼링 사이즈 제한](#125-코덱-limits) 혹은 [민감한 데이터 로깅](#webflux-logging-sensitive-data)처럼 이러한 기호(preferences)를 필요로 할 수 있다.  
  
다음 예제는 클라이언트측 요청에 대한 커스텀 코덱 설정이다:  
  

Java

```java
WebClient webClient = WebClient.builder()
        .codecs(configurer -> {
                CustomDecoder decoder = new CustomDecoder();
                configurer.customCodecs().registerWithDefaultConfig(decoder);
        })
        .build();
```

Kotlin

```kotlin
val webClient = WebClient.builder()
        .codecs({ configurer ->
                val decoder = CustomDecoder()
                configurer.customCodecs().registerWithDefaultConfig(decoder)
         })
        .build()
```

  

## 1.3. DispatcherHandler

스프링 웹플럭스는 스프링 MVC와 유사한 프론트 컨트롤러 패턴으로 설계되었다. 중앙의 WebHandler, DispatcherHandler는 요청 처리 알고리즘이 동일하다. 실제 작업은 설정 가능한 위임 컴포넌트에 의해 이루어진다. 이 모델은 유연하며, 다양한 형태의 작업 흐름을 지원한다.  
  
DispatcherHandler는 스프링 설정으로부터 필요한 위임 컴포넌트를 찾는다. 스프링 빈으로 만들어졌으며, ApplicationContextAware를 구현하여 자신이 속한 컨텍스트에 접근한다. DispatcherHandler의 빈 이름이 webHandler으로 선언되면 결국 [WebHttpHandlerBuilder](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/server/adapter/WebHttpHandlerBuilder.html)에 의해 발견되어 사용된다. WebHttpHandlerBuilder는 [WebHandler API](#122-webhandler-api)에 따라 요청 처리 체인을 구성한다.  
  
웹플럭스 어플리케이션의 스프링 설정은 보통 다음의 사항을 포함한다:

*   빈 이름이 webHandler으로 선언된 DispatcherHandler
*   webFilter와 webExceptionHandler 빈
*   [DispatcherHandler 스페셜 빈](#13-dispatcherhandler)
*   기타 등등

  
이 설정은 WebHttpHandlerBuilder에게 주어져 요청 처리 체인이 만들어진다. 다음은 그 예제이다:  
  

Java

```java
ApplicationContext context = ...
HttpHandler handler = WebHttpHandlerBuilder.applicationContext(context).build();
```

Kotlin

```kotlin
val context: ApplicationContext = ...
val handler = WebHttpHandlerBuilder.applicationContext(context).build()
```

  
위 코드 결과의 HttpHandler는 [서버 어댑터](#121-httphandler)와 함께 사용된다.  
  

## 1.3.1. 스페셜 빈 타입

DispatcherHandler는 요청을 처리하고 적절한 응답을 주기 위해 스페셜 빈으로 작업을 위임한다. "스페셜 빈" 이란 웹플럭스 프레임워크의 요소를 구현한 스프링으로 관리되는 객체 인스턴스를 의미한다. 기본 내장 형태(built-in)가 보통이지만, 그 속성값을 변경하거나 빈을 확장(extend)하거나 다른 빈으로 대체(replace)하는 일도 가능하다.  
  
다음 테이블은 DispatcherHandler에 의해 감지되는 스페셜 빈 목록을 보여준다. 로우 레벨에서는 이 밖에 다른 빈들도 존재한다.(웹 핸들러 API의 [Special bean types](#131-스페셜-빈-타입)를 보라).  


| 빈 타입                                                                                                                                                                                                                                                                                                                                                                                                                                  | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HandlerMapping                                                                                                                                                                                                                                                                                                                                                                                                                        | 요청을 핸들러에 매핑한다. 매핑은 몇 가지 조건에 기반하여 이루어진다. 이 조건은 HandlerMapping 구현체에 따라 달라진다. -어노테이티드 컨트롤러, 단순 URL 패턴 매핑, 기타 등 핸들러. @RequestMapping 적용 메서드에 대한 주요 HandlerMapping 구현체는 RequestMappingHandlerMapping, 함수형 엔드포인트 라우팅에 대해서는 RouterFunctionMapping, 명시적 URI 경로 패턴 및 WebHandler 인스턴스 등록에 대해서는 SimpleUrlHandlerMapping이 된다. |
| HandlerAdapter                                                                                                                                                                                                                                                                                                                                                                                                                        | DispatcherHandler가 요청에 매핑된 핸들러를 실행하는 작업을 돕는다. 실제로 핸들러가 어떤 방식으로 실행되는지는 상관없다. 예를 들어, 어노테이티드 컨트롤러는 어노테이션 리졸빙을 필요로한다. HandlerAdapter의 주 목적은 DispatcherHandler를 그러한 구체적인 부분으로부터 분리하는 것이다.                                                                                                                                                                                                                                                  |
| HandlerResultHandler                                                                                                                                                                                                                                                                                                                                                                                                                  | 핸들러의 실행 결과를 처리하여 응답을 마친다. [Result Handling](<#webflux-resulthandling>)에서 다룬다.                                                                                                                                                                                                                                                                                                                                                         |

## 1.3.2. 웹플럭스 설정

어플리케이션의 요청 처리의 기반이 되는 빈을 선언할 수 있다.([Web Handler API](#131-스페셜-빈-타입)와 [DispatcherHandler](#13-dispatcherhandler)에 나열된 빈) 그러나 대부분의 경우에 있어 [WebFlux Config](#111-웹플럭스-설정webflux-config)는 최고의 시작점이 된다. 필요한 빈을 선언하고, 커스터마이징을 위한 더 고수준의 콜백 API 설정을 제공한다.  
  
#스프링 부트는 웹플럭스 설정을 통해 스프링 웹플럭스를 설정하며, 또한 많은 편리한 옵션을 추가로 제공한다.  
  

## 1.3.3. 처리

DispatcherHandler는 다음에 따라 요청을 처리한다:

*   각 HandlerMapping에게 매칭 핸들러를 요청한다. 처음 매칭된 핸들러가 사용된다.
*   핸들러를 찾으면, 적절한 HandlerAdapter를 통해 이 핸들러를 실행한다. 핸들러 실행의 반환값은 HandlerResult이다.
*   HandlerAdapter 로부터 반환된 HandlerResult는 적절한 HandlerResultHandler에게 주어지며, 직접 응답을 주거나, 혹은 뷰를 사용하여 요청 처리를 완료한다.

  

## 1.3.4. 결과 핸들링

HandlerAdapter로 핸들러를 실행하여 나온 반환값은 몇몇 추가적인 컨텍스트와 함께 HandlerResult로 래핑된다. 그리고 이 반환값은 HandlerResult 핸들링을 지원하는 첫 HandlerResultHandler에게 전달된다. 다음 테이블은 사용 가능한 HandlerResultHandler 구현체를 보여준다. 여기에 나온 모든 구현체는 [WebFlux Config](#111-웹플럭스-설정webflux-config)에서 정의한다:  
  
| 타입                                                                                                                                                                                                                                                                                                                                                                                        | 반환값                                                                                                                                                                                                                                                                                                                                                                                       | 디폴트 적용 순서                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ResponseEntityResultHandler                                                                                                                                                                                                                                                                                                                                                               | ResponseEntity, 보통 @Controller 인스턴스로부터 반환된다.                                                                                                                                                                                                                                                                                                                                              | 0                                                                                                                                                                                                                                                                                                                                                                                         |
| ServerResponseResultHander                                                                                                                                                                                                                                                                                                                                                                | ServerResponse, 보통 함수형 엔드포인트로부터 반환된다.                                                                                                                                                                                                                                                                                                                                                     | 0                                                                                                                                                                                                                                                                                                                                                                                         |
| ResponseBodyResultHandler                                                                                                                                                                                                                                                                                                                                                                 | @ResponseBdoy 메서드나 @RestController 클래스로부터의 반환값을 핸들링한다.                                                                                                                                                                                                                                                                                                                                    | 100                                                                                                                                                                                                                                                                                                                                                                                       |
| ViewResolutionResultHandler                                                                                                                                                                                                                                                                                                                                                               | CharSequence, View, [Model](<https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/ui/Model.html>), Map, [Rendering](<https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/reactive/result/view/Rendering.html>), 이외 모델 어트리뷰트로 취급되는 Object. [View Resolution](<#webflux-viewresolution>)에서 다룬다. | Integer.MAX\_VALUE                                                                                                                                                                                                                                                                                                                                                                        |


## 1.3.5. 익셉션

HandlerAdapter 로부터 반환된 HandlerResult는 몇가지 핸들러 특징적인 메커니즘에 기반한 에러 핸들링 함수를 제공한다. 이 에러 핸들링 함수가 호출되는 조건은 다음과 같다:

*   핸들러 실행 실패
*   HandlerResultHandler의 핸들러 결과값 핸들링 실패

  
핸들러가 반환한 리액티브 타입이 데이터를 생성하기 전에 에러 시그널이 발생하게 되면 이 에러 핸들링 함수는 응답을 변경할 수 있다.(예로, 에러 상태 코드)  
  
이것이 @Controller 클래스의 @ExceptionHandler 메서드가 작동하는 방식이다. 반면 스프링 MVC는 HandlerExceptionResolver를 기반으로 한다. 이 차이점은 보통 큰 상관이 없지만, 웹플럭스에서는 핸들러가 선택되기 전에 발생한 익셉션은 @ControllerAdvice으로 핸들링할 수 없음은 유념해야 한다.  
  
더한 내용은 "어노테이티드 컨트롤러" 섹션의 [Managing Exceptions](#webflux-ann-controller-exceptions) 또는 웹 핸들러 API 섹션의 [Exceptions - webflux-exception-handler](#124-익셉션exceptions)에서 다룬다.  
  

## 1.3.6. 뷰 리솔루션

뷰 리솔루션은 특정한 뷰 기술에 구애받지 않으면서 HTML 템플릿과 모델을 이용하여 브라우저에 응답을 렌더링하도록 한다. 스프링 웹플럭스의 뷰 리솔루션은 HandlerResultHandler을 통해 이루어진다. [HandlerResultHandler](#webflux-resulthandling)는 VeiwResolver 인스턴스를 사용하여 논리적 뷰 이름을 나타내는 String을 View 인스턴스로 매핑한다. 이 View는 응답 렌더링에 사용된다.  
  

#### 핸들링

  
ViewResolutionResultHandler로 전달된 HandlerResult는 핸들러의 반환값과 모델이 가진, 요청 처리 과정에서 추가된 어트리뷰트를 포함한다. 이 반환값은 다음과 같이 처리된다:

*   String, CharSequence: 논리적 뷰 이름으로, 설정된 ViewResolver 구현체 목록에서 View를 가져온다.
*   void: 요청 경로에 기반하여 기본 디폴트 뷰 이름을 선택한다. 경로 처음과 끝 슬래시를 뺀 값을 View로 한다. 반환된 뷰 이름이 없을 경우나(예를 들어, 모델 어트리뷰터가 반환되지 않을 때), 값이 비동기 반환값일 때도 똑같이 동작한다(예를 들어, Mono가 빈 값으로 완료될 때).
*   [Rendering](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/reactive/result/view/Rendering.html): 뷰 리솔루션 시나리오 API. 통합개발환경(IDE)의 코드 컴플리션의 옵션을 탐색한다.
*   Model, Map: 추가적인 모델 어트리뷰트로, 요청의 모델에 추가된다.
*   그 외: [BeanUtils#isSimpleProperty](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/beans/BeanUtils.html#isSimpleProperty-java.lang.Class-) 에 의해 결정되는 단순 타입을 제외하고, 이외의 반환값은 요청의 모델에 추가되는 모델 어트리뷰트로 취급된다. @ModelAttribute 핸들러 메서드가 아니라면, 어트리뷰트 이름은 [conventions](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/core/Conventions.html)를 사용하여 클래스 이름으로부터 얻어진다.

  
모델은 비동기, 리액티브 타입을 포함할 수 있다(예로, Reactor 또는 RxJava 로부터). AbstractView는 이러한 모델 어트리뷰트를 구체적인 값으로 리졸빙하고 그 모델을 업데이트한다. 이 작업은 뷰 렌더링 작업 전에 이루어진다. 단일 값 리액티브 타입은 단일 값 혹은 빈 값(비어있다면)으로 리졸빙되며, Flux<T> 와 같은 다수 값 리액티브 타입은 모아져(collected) List<T> 로 리졸빙된다.  
  
뷰 리솔루션 설정은 스프링 설정에 ViewResolutionResultHandler 빈을 추가하는 것 만큼 쉽다. [WebFlux Config](#)는 뷰 리솔루션 전용 설정을 제공한다.  
  
스프링 웹플럭스와 통합된 뷰 기술에 대해서는 [View Technologies](#19-뷰-기술view-technologies)에서 더 많은 정보를 찾아볼 수 있다.  
  

#### 리다이렉팅

  
뷰 네임의 접두어로 쓰이는 redirect: 는 리다이렉팅을 수행한다. UrlBasedViewResolver(그리고 그 서브클래스들) 은 이 접두어를 리다이렉팅 요청으로 받아들인다. 접두어를 제외한 나머지 부분이 리다이렉팅 경로 URL이 된다.  
  
redirect: 의 리다이렉팅에 있어서의 효과는 컨트롤러가 RedirectView 또는 Rendering.redirectTo("abc").build()를 반환한 것과 동일하지만, 이렇게 할 경우 컨트롤러는 자체적으로 뷰 이름에 관한 연산이 가능해진다. redirect:/some/resource/ 와 같은 뷰 이름은 현재 어플리케이션으로 연결되지만, redirect:https://example.com/arbitrary/path는 절대 경로 URL으로 리다이렉팅한다.  
  

#### 컨텐츠 협상

  
ViewResolutionResultHandler는 컨텐츠 협상을 지원한다. 요청 미디어 타입을 선택된 View가 지원하는 미디어 타입과 비교한다. 그리고 요청된 미디어 타입을 지원하는, 첫 번째로 발견된 View가 사용된다.  
  
JSON, XML 과 같은 미디어 타입을 지원하기 위해, 스프링 웹플럭스는 HttpMessageWriterView를 제공한다. 이 특별한 View는 [HttpMessageWriter](#125-코덱)를 통해 렌더링 작업을 수행한다. 보통 [WebFlux Configuration](#111-웹플럭스-설정webflux-config-view-resolvers)을 통해 이 View를 디폴트 뷰로 설정하게 된다. 요청 미디어 타입에 매칭될 경우, 언제나 디폴트 뷰가 선택되어 사용된다.  
  

## 1.4. 어노테이티드 컨트롤러

스프링 웹플럭스는 어노테이션 기반 프로그래밍 모델을 제공한다. @Controller와 @RestController 컴포넌트는 어노테이션을 사용하여 요청 매핑, 요청 인풋, 익셉션 핸들링 그리고 기타 필요한 작업을 지정한다. 어노테이티드 컨트롤러는 유연한 메서드 시그니처를 가지며, 기반 클래스를 확장(extend)하거나 특정 인터페이스를 구현할 필요가 없다.  
  
다음은 어노테이티드 컨트롤러의 기본적인 예제이다:  
  

Java

```java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String handle() {
        return "Hello WebFlux";
    }
}
```

Kotlin

```kotlin
@RestController
class HelloController {

    @GetMapping("/hello")
    fun handle() = "Hello WebFlux"
}
```

  
위 예제의 메서드는 String를 반환하고, 이 반환값은 요청 본문에 쓰인다.  
  

## 1.4.1 @Controller

표준 스프링 빈 정의에 따라 컨트롤러 빈을 정의할 수 있다. @Controller 스테레오타입은 클래스패스의 @Component 클래스 자동 감지 및 빈 등록을 허용한다. 또한 웹 컴포넌트임을 나타내는 어노테이션 적용 클래스의 스테레오 타입 역할을 한다.  
  
아래와 같이, 자바 설정에 컴포넌트 스캐닝을 추가하여 @Controller와 같은 빈의 자동 감지를 활성화한다:  
  

Java

```java
@Configuration
@ComponentScan("org.example.web") (1)
public class WebConfig {

    // ...
}
```

Kotlin

```kotlin
@Configuration
@ComponentScan("org.example.web") (1)
class WebConfig {

    // ...
}
```

  
(1) `org.example.web` 패키지를 스캐닝한다.  
  
@RestController는 스스로 @Contoller와 @ResponseBody를 적용하는 [composed annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#beans-meta-annotations)이다. 타입 레벨으로 모든 메서드에 @ResponseBody가 적용되는 컨트롤러임을 나타내며, 고로 뷰 리솔루션와 HTML 템플릿 렌더링을 수행하지 않고 응답 본문을 직업 작성한다.  
  

## 1.4.2. 요청 매핑

@RequestMapping 어노테이션은 컨트롤러에의 메서드와 요청을 매핑하기 위해 사용된다. 이 어노테이션은 URL, HTTP 메서드, 요청 파라미터, 헤더, 미디어 타입 각각으로 요청을 매핑하기 위한 다양한 어트리뷰트를 가지고 있다. 이 어노테이션은 클래스 레벨에 적용하여 메서드들의 매핑 공유에 사용할 수도 있고, 메서드 레벨에 적용하여 특정 엔드포인트로의 매핑을 지정할 수도 있다.  
  
다음 어노테이션들은 HTTP 메서드로 요청을 매핑하는 @RequestMapping의 변형이다:  
  

*   @GetMapping
*   @PostMapping
*   @PutMapping
*   @DeleteMapping
*   @PatchMapping

  
위 어노테이션들은 함께 제공되는 [Custom Annotations](#webflux-ann-requestmapping-composed)이다. 이런 어노테이션들이 제공되는 이유는, 대부분의 컨트롤러에 있어서 @RequestMapping을 기본 형태로 사용하여 HTTP 메서드를 고려하지 않는 URL 매핑을 적용하기 보다는 특정 HTTP 메서드로의 매핑을 적용하는 것이 바람직하기 때문이다. 동시에 @RequestMapping은 클래스 레벨로 적용하여 매핑 범위를 공유하는 데에 사용할 수 있다.  
  
다음은 클래스 레벨과 메서드 레벨 매핑 예제이다:  
  

Java

```java
@RestController
@RequestMapping("/persons")
class PersonController {

    @GetMapping("/{id}")
    public Person getPerson(@PathVariable Long id) {
        // ...
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void add(@RequestBody Person person) {
        // ...
    }
}
```

Kotlin

```kotlin
@RestController
@RequestMapping("/persons")
class PersonController {

    @GetMapping("/{id}")
    fun getPerson(@PathVariable id: Long): Person {
        // ...
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun add(@RequestBody person: Person) {
        // ...
    }
}
```

  

#### URI 패턴

  
글롭 패턴(glob pattern) 과 와일드카드를 사용하여 요청을 매핑할 수 있다:

*   ? 는 한 문자와 매칭된다.
*   \* 는 한 경로 세그먼트 안에서 0 개 이상의 문자와 매칭된다.
*   \*\* 는 경로 세그먼트를 포함하여 0 개 이상의 문자와 매칭된다.

  
URI 변수를 선언하고 변수의 값을 @PathVariable으로 접근하는 일도 가능하다:  
  

Java

```java
@GetMapping("/owners/{ownerId}/pets/{petId}")
public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
    // ...
}
```

Kotlin

```kotlin
@GetMapping("/owners/{ownerId}/pets/{petId}")
fun findPet(@PathVariable ownerId: Long, @PathVariable petId: Long): Pet {
    // ...
}
```

  
클래스 레벨과 메서드 레벨에서 각각 URL 변수를 선언하는 일도 가능하다:  
  

Java

```java
@Controller
@RequestMapping("/owners/{ownerId}") (1)
public class OwnerController {

    @GetMapping("/pets/{petId}") (2)
    public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
        // ...
    }
}
```

Kotlin

```kotlin
@Controller
@RequestMapping("/owners/{ownerId}") (1)
class OwnerController {

    @GetMapping("/pets/{petId}") (2)
    fun findPet(@PathVariable ownerId: Long, @PathVariable petId: Long): Pet {
        // ...
    }
}
```

  
(1) 클래스 레벨 URI 매핑 (2) 메서드 레벨 URI 매핑  
  
URI 변수는 적절한 타입으로 자동 컨버팅되거나 TypeMismatchException 이 발생한다. int, long, Date 및 기타 등등과 같은 단순 타입은 기본으로 지원되고, 이 외 다른 데이터 타입을 등록하는 일도 가능하다. 이 부분은 [Type Conversion](#webflux-ann-typeconversion)과 [DataBinder](#webflux-ann-initbinder)에서 다룬다.  
  
@PathVariable("customId") 처럼, URI 변수명은 명시적으로 지정될 수 있지만, 사용되는 이름이 동일하고, 디버깅 정보로 컴파일이 이루어지거나 Java8 의 -parameter 컴파일러 플래그를 사용한다면 이런 상세한 부분은 생략할 수 있다.  
  
{\*varName} 문법은 0 개 이상의 남은 경로 세그먼트와 매칭되는 URI 변수를 선언한다. 예를 들어 /resources/{\*path} 는 /resources/ 의 모든 파일과 매칭되고, "path" 변수는 완전한 상대경로를 캡쳐한다.  
  
{varName:regex} 문법은 URI 변수를 {varName:regex} 문법을 가진 정규식으로 선언한다. 예를 들어 URL 경로 /spring-web-3.0.5.jar가 주어지면 다음 메서드는 이름, 변수, 파일 확장자를 추출한다:  
  

Java

```java
@GetMapping("/{name:[a-z-]+}-{version:\\d\\.\\d\\.\\d}{ext:\\.[a-z]+}")
public void handle(@PathVariable String version, @PathVariable String ext) {
    // ...
}
```

Kotlin

```kotlin
@GetMapping("/{name:[a-z-]+}-{version:\\d\\.\\d\\.\\d}{ext:\\.[a-z]+}")
fun handle(@PathVariable version: String, @PathVariable ext: String) {
    // ...
}
```

  
URI 경로 패턴은 내장된 ${...} 플레이스홀더를 가지고 있다. 이 플레이스홀더는 로컬, 시스템, 환경, 그리고 다른 프로퍼티 자원에 대한 PropertyPlaceHolderConfigurer을 통해 시작 시점에 리졸빙된다. 이 기능은 외부 설정에 기반한 기본 URL 파라미터 처리에 사용될 수 있다.  
  
> 스프링 웹플럭스는 PathPattern 과 PathPatternParser를 사용하여 URI 경로 매칭을 지원한다. 이 두 클래스는 spring-web 에 포함되어 있으며, 런타임에 많은 수의 URI 경로 패턴 매칭이 발생하는 웹 어플리케이션에서 HTTP URL 경로와 함께 사용되도록 명시적으로 만들어져 있다. 
> 스프링 웹플럭스는 접미어 패턴 매칭을 지원하지 않는다. 스프링 MVC 에서는 /person.\* 이 /person으로 매칭되지만, 스프링 웹플럭스는 이를 지원하지 않는다. URL 기반 컨텐츠 협상에 대해서는 필요하다면 쿼리 파라미터를 사용하길 권한다. 쿼리 파라미터는 더 단순하고, 더 명시적이며, URL 경로를 악용하는 취약성 측면에서 더 낫다.  
  

#### 패턴 비교

  
한 URL 에 다수의 패턴이 매칭될 때는 이들 중 가장 적합한 매칭을 찾기 위해 패턴 비교 작업이 필요하다. 이 작업은 PathPattern.SPECIFICITY\_COMPARATOR으로 수행된다. 보다 구체적으로 매칭되는 패턴을 찾는다.  
  
모든 패턴에는 URI 변수와 와일드카드의 숫자에 근거한 점수가 산정된다. URI 변수는 와일드카드보다 낮은 점수를 가진다. 점수의 총합이 낮은 패턴이 선택되며, 두 패턴이 같은 점수를 가질 경우 더 긴 패턴이 선택된다.  
  
캐치올(catch-all) 패턴(\*\*, {\*varName}) 은 이 점수 산정에서 제외되고, 언제나 가장 낮은 우선순위를 갖는다. 두 패턴이 모두 캐치올 패턴이라면, 더 긴 패턴이 선택된다.  
  

#### 소비형(consumable) 미디어 타입

  
다음과 같이, 요청의 Content-Type으로 요청 매핑을 좁힐 수 있다:  
  

Java

```java
@PostMapping(path = "/pets", consumes = "application/json")
public void addPet(@RequestBody Pet pet) {
    // ...
}
```

Kotlin

```kotlin
@PostMapping("/pets", consumes = ["application/json"])
fun addPet(@RequestBody pet: Pet) {
    // ...
}
```

  
consumes 어트리뷰트는 협상 표현식을 지원한다. 예로, !text/plain은 text/plain을 제외한 컨텐츠 타입을 의미한다.  
  
클래스 레벨에 consumes 어트리뷰트를 선언하여 메서드 매핑에 공유할 수 있다. 다른 대부분의 요청 매핑 어트리뷰트와는 달리, consume 어트리뷰트가 클래스 레벨과 메서드 레벨에서 함께 사용될 경우 메서드 레벨의 어트리뷰트가 적용되고, 클래스 레벨의 어트리뷰트는 무시된다.  
  
> MediaType은 공통적으로 사용되는 미디어 타입 상수를 제공한다 - 예로, APPLICATION\_JSON\_VALUE, APPLICATION\_XML\_VALUE.  
  

#### 생산형(producible) 미디어 타입

  
다음과 같이, 요청 헤더의 Accept와 컨트롤러 메서드가 생산하는 컨텐츠 타입 목록으로 요청 매핑을 좁힐 수 있다:  
  

Java

```java
@GetMapping(path = "/pets/{petId}", produces = "application/json")
@ResponseBody
public Pet getPet(@PathVariable String petId) {
    // ...
}
```

Kotlin

```kotlin
@GetMapping("/pets/{petId}", produces = ["application/json"])
@ResponseBody
fun getPet(@PathVariable String petId): Pet {
    // ...
}
```

  
이 미디어 타입은 문자 집합을 특정할 수 있다. 부정 표현식이 지원된다 - 예로, !text/plain은 text/plain을 제외한 컨텐츠 타입을 의미한다.  
  
클래스 레벨에 produces 어트리뷰트를 선언하여 메서드 매핑에 공유할 수 있다. 다른 대부분의 요청 매핑 어트리뷰트와는 달리, produces 어트리뷰트가 클래스 레벨과 메서드 레벨에서 함께 사용될 경우 메서드 레벨의 어트리뷰트가 적용되고, 클래스 레벨의 어트리뷰트는 무시된다.  
  
> MediaType은 공통적으로 사용되는 미디어 타입 상수를 제공한다 - 예로, APPLICATION\_JSON\_VALUE, APPLICATION\_XML\_VALUE.  
  

#### 파라미터와 헤더

  
쿼리 파라미터 조건으로 요청 매핑을 좁힐 수 있다. 특정 쿼리 파라미터의 존재 여부로 체크할 수 있고(myParam, !myParam) , 특정 값 여부로 체크할 수도 있다(myParam=myValue). 다음은 그 예제이다:  
  

Java

```java
@GetMapping(path = "/pets/{petId}", params = "myParam=myValue") (1)
public void findPet(@PathVariable String petId) {
    // ...
}
```

Kotlin

```kotlin
@GetMapping("/pets/{petId}", params = ["myParam=myValue"]) (1)
fun findPet(@PathVariable petId: String) {
    // ...
}
```

  
(1) `myParam` 파라미터의 값이 `myValue` 인지 체크한다.  
  
또한 헤더의 조건으로 체크할 수도 있다:  
  

Java

```java
@GetMapping(path = "/pets", headers = "myHeader=myValue") (1)
public void findPet(@PathVariable String petId) {
    // ...
}
```

Kotlin

```kotlin
@GetMapping("/pets", headers = ["myHeader=myValue"]) (1)
fun findPet(@PathVariable petId: String) {
    // ...
}
```

  
(1) `myHeader`의 값이 `myValue` 인지 체크한다.  
  

#### HTTP HEAD, OPTIONS

  
@GetMappping 과 @RqeustMapping(method=HttpMethod.GET) 은 요청 매핑 목적의 HTTP HEAD를 투명하게 지원한다. 컨트롤러 메서드는 변경될 필요가 없다. HttpHandler 서버 어댑터의 응답 래퍼는 실제 응답을 주지 않으면서 Content-Length 헤더에 바이트 수를 설정한다.  
  
기본적으로 HTTP OPTIONS 핸들링은 매칭 URL 패턴을 가진 모든 @RequsetMapping 메서드의 HTTP 메서드 목록에 Allow 응답 헤더를 설정함으로써 이루어진다.  
  
HTTP 메서드 선언이 없는 @RequestMapping의 경우, Allow 헤더는 GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS로 설정된다. 컨트롤러 메서드는 언제나 지원되는 HTTP 메서드로 선언되어야 한다(예로, @GetMapping, @PostMapping 및 기타 등과 같은 HTTP 메서드 특정 매핑을 사용한다).  
  
@RequestMapping 메서드를 HTTP HEAD와 HTTP OPTIONS으로 명시적으로 매핑할 수 있지만, 보통의 경우 불필요한 일이다.  
  

#### 커스텀 어노테이션

  
스프링 웹플럭스는 요청 매핑에 있어 [composed annoations(이하 컴포즈드 어노테이션)](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#beans-meta-annotations) 사용을 지원한다. 이런 어노테이션은 스스로 @RequestMapping을 적용하고 구성하여 필요한 @RequestMapping 어트리뷰트를 설정하여 보다 특정적이고 구체적인 목적으로 사용할 수 있다.  
  
@GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping은 컴포즈드 어노테이션의 예이다. 이런 어노테이션들이 제공되는 이유는, 대부분의 컨트롤러에 있어서 @RequestMapping을 기본 형태로 사용하여 HTTP 메서드를 고려하지 않는 URL 매핑을 적용하기 보다는 특정 HTTP 메서드로의 매핑을 적용하는 것이 바람직하기 때문이다. 컴포즈드 어노테이션의 예제가 필요하다면 이 어노테이션들이 어떻게 선언되어 있는지 보면 된다.  
  
스프링 웹플럭스는 또한 커스텀 요청 매칭 로직을 가진 커스텀 요청 매핑 어트리뷰트를 지원한다. 이 방법은 RequestMappingHandlerMapping을 확장하여 getCustomMethodCondition 메서드를 오버라이딩하는, 보다 고차원의 옵션이다. getCustomMethodCondition 메서드는 커스텀 어트리뷰트를 체크하고 당신만의 RequestCondition를 반환할 수 있다.  
  

#### 명시적 등록

  
핸들러 메서드를 프로그래밍 방식으로 등록할 수 있다. 이 방식은 핸들러 메서드를 동적으로 등록하거나, 같은 핸들러의 서로 다른 인스턴스들로 서로 다른 URL을 처리하는 경우와 같이 보다 고차원적인 목적으로 사용될 수 있다. 다음은 그 예제이다:  
  

Java

```java
@Configuration
public class MyConfig {

    @Autowired
    public void setHandlerMapping(RequestMappingHandlerMapping mapping, UserHandler handler) (1)
            throws NoSuchMethodException {

        RequestMappingInfo info = RequestMappingInfo
                .paths("/user/{id}").methods(RequestMethod.GET).build(); (2)

        Method method = UserHandler.class.getMethod("getUser", Long.class); (3)

        mapping.registerMapping(info, handler, method); (4)
    }

}
```

Kotlin

```kotlin
@Configuration
class MyConfig {

    @Autowired
    fun setHandlerMapping(mapping: RequestMappingHandlerMapping, handler: UserHandler) { (1)

        val info = RequestMappingInfo.paths("/user/{id}").methods(RequestMethod.GET).build() (2)

        val method = UserHandler::class.java.getMethod("getUser", Long::class.java) (3)

        mapping.registerMapping(info, handler, method) (4)
    }
}
```

  
(1) 타겟 핸들러와 핸들러 매핑을 컨트롤러에 주입한다. (2) 요청 매핑 메타데이터를 준비한다. (3) 핸들러 메서드를 얻는다. (4) 등록한다.  
  

## 1.4.3. 핸들러 메서드

@RequestMapping 핸들러 메서드는 유연한 시그니처를 가지며, 지원되는 컨트롤러 규먼트와 반환값을 골라 사용할 수 있다.  
  

#### 메서드 아규먼트

  
다음 테이블은 지원되는 컨트롤러 메서드 아규먼트를 보여준다.  
  
리액티브 타입(Reactor, RxJava, [기타 등](#webflux-reactive-libraries)) 블로킹 I/O를 요구하는 아규먼트를 지원한다(예로, 요청 본문 읽기). 이는 설명 컬럼에 표시되어 있다. 리액티브 타입은 블로킹을 요구하지 않는 아규먼트에는 존재하지 않는다.  
  
JDK 1.8 의 java.util.Optional은 requried 어트리뷰트를 가진 어노테이션과 함께 메서드 아규먼트로 지원되며(@RequestParam, @RequestHeader, 기타 등), required=false와 동등하다.  
  
| 컨트롤러 메서드 아규먼트                                                                                                                                                                                                                                                                                                              | 설명                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ServerWebExchange                                                                                                                                                                                                                                                                                                          | ServerWebExchange 전체에 접근한다 - HTTP 요청과 응답, 요청과 세션 어트리뷰트, checkNotModified 메서드, 그리고 기타 등등을 얻을 수 있다.                                                                                                                                                                                                                          |
| ServerHttpRequest                                                                                                                                                                                                                                                                                                          | ServerHttpResponse / HTTP 요청이나 응답에 접근한다.                                                                                                                                                                                                                                                                                   |
| WebSession                                                                                                                                                                                                                                                                                                                 | 세션에 접근한다. 따로 추가된 어트리뷰트가 없다면, 새 세션의 시작을 강제하지는 않는다. 리액티브 타입을 지원한다.                                                                                                                                                                                                                                                           |
| java.security.Principal                                                                                                                                                                                                                                                                                                    | 현재 인가된 유저 - 알려진 특정 Principal 구현체가 있다면 그것이 될 것이다. 리액티브 타입을 지원한다.                                                                                                                                                                                                                                                            |
| org.springframework.http.HttpMethod                                                                                                                                                                                                                                                                                        | 요청의 HTTP 메서드.                                                                                                                                                                                                                                                                                                              |
| java.util.Locale                                                                                                                                                                                                                                                                                                           | 현재 요청의 로케일. 사용 가능한 가장 구체적인 LocaleResolver 에 의해 결정된다. 사실상, 설정된 LocaleResolver / LocaleContextResolver가 된다.                                                                                                                                                                                                                  |
| java.util.TimeZone + java.time.ZoneId                                                                                                                                                                                                                                                                                      | 현재 요청과 관련된 타임 존. LocaleContextResolver 에 의해 결정된다.                                                                                                                                                                                                                                                                          |
| @PathVariable                                                                                                                                                                                                                                                                                                              | URI 템플릿 변수로 접근하기 위해 사용된다. [URI Patterns](<webflux-ann-requestmapping-uri-templates>)를 보라.                                                                                                                                                                                                                                 |
| @MatrixVariable                                                                                                                                                                                                                                                                                                            | URI 경로 세그먼트의 이름-값 쌍으로 접근하기 위해 사용된다. [Matrix Variables](<#webflux-ann-matrix-variables>)를 보라.                                                                                                                                                                                                                               |
| @RequestParam                                                                                                                                                                                                                                                                                                              | 서블릿 요청 파라미터에 접근하기 위해 사용된다. 파라미터 값은 선언된 메서드 아규먼트 타입으로 컨버팅된다. [@RequestParam](<#webflux-ann-requestparam>)을 보라.
 @RequestParam 사용은 선택적이다 - 예로, 이 어노테이션의 어트리뷰트를 설정하기 위해 사용할 수 있다. 이 테이블의 "이 외의 아규먼트"를 보라.                                                                                                          |
| @RequestHeader                                                                                                                                                                                                                                                                                                             | 요청 헤더에 접근하기 위해 사용된다. 헤더 값은 선언된 메서드 아규먼트 타입으로 컨버팅된다. [@RequestHeader](<#webflux-ann-requestheader>)를 보라.                                                                                                                                                                                                                    |
| @CookieValue                                                                                                                                                                                                                                                                                                               | 쿠키에 접근하기 위해 사용된다. 쿠키 값은 선언된 메서드 아규먼트 타입으로 컨버팅된다. [@CookieValue](<#webflux-ann-cookievalue>)를 보라.                                                                                                                                                                                                                           |
| @RequestBody                                                                                                                                                                                                                                                                                                               | 요청 본문에 접근하기 위해 사용된다. 본문 내용은 선언된 메서드 아규먼트 타입으로 컨버팅된다. 이 컨버팅에는 HttpMessageReader 인스턴스가 사용된다. [@RequestBody](<#webflux-ann-requestbody>)를 보라.                                                                                                                                                                                 |
| HttpEntity                                                                                                                                                                                                                                                                                                                 | 요청 헤더와 본문에 접근하기 위해 사용된다. 본문은 HttpMessageReader 인스턴스를 사용하여 컨버팅된다. 리액티브 타입을 지원한다. [HttpEntity](<#webflux-ann-httpentity>)를 보라.                                                                                                                                                                                               |
| @RequestPart                                                                                                                                                                                                                                                                                                               | multipart/form-data 요청의 파트에 접근하기 위해 사용된다. 리액티브 타입을 지원한다. [Multipart Content](<#멀트파트-컨텐츠>)와 [Multipart Data](<#멀티파트-데이터>)를 보라.                                                                                                                                                                      |
| HttpEntity                                                                                                                                                                                                                                                                                                                 | 요청 헤더와 본문에 접근하기 위해 사용된다. 본문은 HttpMessageReader 인스턴스를 사용하여 컨버팅된다. 리액티브 타입을 지원한다. [HttpEntity](<#webflux-ann-httpentity>)를 보라.                                                                                                                                                                                               |
| java.util.Map, org.springframework.ui.Model, org.springframework.ui.ModelMap                                                                                                                                                                                                                                               | HTML 컨트롤러에 사용되고 뷰 렌더링의 일부로서 템플릿이 되는 모델에 접근하기 위해 사용된다.                                                                                                                                                                                                                                                                      |
| @ModelAttribute                                                                                                                                                                                                                                                                                                            | 데이터 바인딩과 검증이 적용되는 모델(없다면 초기화한다)에 존재하는 어트리뷰트에 접근하기 위해 사용된다. [@ModelAttibute](<#webflux-ann-modelattrib-method-args>) 그리고 [Model](<#webflux-ann-modelattrib-methods>) 및 [DataBinder](<#webflux-ann-initbinder>)를 보라.
@ModelAttibute는 선택적이다 - 예로, 이 어노테이션의 어트리뷰트를 설정하기 위해 사용할 수 있다. 이 테이블의 "이 외의 아규먼트"를 보라.        |
| Errors, BindingResult                                                                                                                                                                                                                                                                                                      | 벨리데이션과 커맨드 객체(@ModelAttribute 아규먼트) 로의 데이터 바인딩, 혹은 @RequestBody, @RequestPart 아규먼트의 벨리데이션에서 발생한 에러로의 접근을 위해 사용한다. Erros 또는 BindingResult 아규먼트는 반드시 벨리데이션 대상 메서드 아규먼트의 바로 다음에 선언되어야 한다.                                                                                                                                     |
| SessionStatus + class-level @SessionAttributes                                                                                                                                                                                                                                                                             | 요청 처리 완료를 표시하기 위해 사용된다. 요청 처리 완료 시 클래스 레벨 @SessionAttribute 어노테이션을 통해 선언된 세션 어트리뷰트를 비운다. 더 자세한 정보는 [@SessionAttributes](<#>)에서 찾을 수 있다.                                                                                                                                                                                    |
| UriComponentsBuilder                                                                                                                                                                                                                                                                                                       | 현재 요청의 호스트, 포트, 스킴, 경로에 연관된 URL을 준비하기 위해 사용된다. [URI Links](<#webflux-uri-building>)를 보라.                                                                                                                                                                                                                                   |
| @SessionAttribute                                                                                                                                                                                                                                                                                                          | 세션 어트리뷰트에 접근하기 위해 사용된다 - 클래스 레벨 @SessionAttribute의 결과로 세션에 저장된 모델 어트리뷰트와 대조된다. 더 자세한 정보는 [@SessionAttributes](<#webflux-ann-sessionattribute>)에서 찾을 수 있다.                                                                                                                                                                  |
| @RequestAttribute                                                                                                                                                                                                                                                                                                          | 요청 어트리뷰트에 접근하기 위해 사용된다. 더 자세한 정보는 [@RequestAttributes](<#webflux-ann-requestattrib>)에서 찾을 수 있다.                                                                                                                                                                                                                            |
| UriComponentsBuilder                                                                                                                                                                                                                                                                                                       | 현재 요청의 호스트, 포트, 스킴, 경로에 연관된 URL을 준비하기 위해 사용된다. [URI Links](<#webflux-uri-building>)를 보라.                                                                                                                                                                                                                                   |
| 이 외의 아규먼트                                                                                                                                                                                                                                                                                                                  | 메서드 아규먼트가 위에서 다룬 아규먼트들와 매칭되지 않는다면, 단순 타입의 경우 기본적으로 @RequestParam를 통해 리졸빙된다. 단순 타입 여부는 [BeanUtils#isSimpleProperty](<https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/beans/BeanUtils.html#isSimpleProperty-java.lang.Class->)를 통해 결정된다. @RequestParam 이 아니면 @ModelAttribute가 된다. |

#### 반환값

  
다음 테이블은 지원되는 컨트롤러 메서드 반환값을 보여준다. Reactor, RxJava, 혹은 [이 외](#webflux-reactive-libraries)의 리액티브 라이브러리의 리액티브 타입은 일반적으로 모든 반환값을 지원한다.  

| 컨트롤러 메서드 반환값                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @ResponseBody                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 반환값은 HttpMessageWriter 인스턴스를 통해 인코딩되어 응답으로 작성된다. [@ResponseBody](<#webflux-ann-responsebody>)를 보라.                                                                                                                                                                                                                                                                                                                                                            |
| @HttpEntity**, ResponseEntity**                                                                                                                                                                                                                                                                                                                                                                                                                               | 반환값이 응답 전체를 지정한다. HTTP 헤더와 본문 모두 HttpMessageWriter 인스턴스를 통해 인코딩되어 응답으로 작성된다. [@ResponseEntity](<#webflux-ann-responseentity>)를 보라.                                                                                                                                                                                                                                                                                                                            |
| @HttpHeader                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 응답 헤더를 반환하기 위해 사용된다. 본문은 취급하지 않는다.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| String / ViewResolver                                                                                                                                                                                                                                                                                                                                                                                                                                         | 인스턴스가 리졸빙에 사용할 뷰 이름이 된다. 그리고 내포된 모델과 함께 사용된다 - 모델은 커맨드 객체와 @ModelAttribute 메서드를 통해 결정된다. 핸들러 메서드는 Model 아규먼트 선언을 통해 프로그래밍 방식으로 모델을 더욱 풍부하게 만들 수 있다([앞서](<#webflux-viewresolution-handling>) 설명되었다).                                                                                                                                                                                                                                                           |
| String                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 내포된 모델과 함께 렌더링될 View 인스턴스 - 커맨드 객체와 @ModelAttribute 메서드를 통해 결정된다. 핸들러 메서드는 Model 아규먼트 선언을 통해 프로그래밍 방식으로 모델을 더욱 푸부하게 만들 수 있다([앞서](<#webflux-viewresolution-handling>) 설명되었다).                                                                                                                                                                                                                                                                                  |
| java.util.Map, org.springframework.ui.model                                                                                                                                                                                                                                                                                                                                                                                                                   | 내포된 모델에 어트리뷰트를 추가하기 위해 사용된다. 요청 경로를 바탕으로 암시적으로 선택된 뷰 이름과 함께 작동한다.                                                                                                                                                                                                                                                                                                                                                                                             |
| @ModelAttribute                                                                                                                                                                                                                                                                                                                                                                                                                                               | 모델에 한 어트리뷰트를 추가하기 위해 사용된다. 요청 경로를 바탕으로 암시적으로 선택된 뷰 이름과 함께 작동한다.
@ModelArribute를 선택적이다. 이 테이블의 "이 외의 반환값" 을 보라.                                                                                                                                                                                                                                                                                                                                     |
| Rendering                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 모델과 뷰 렌더링 시나리오를 위한 API.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| void                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 반환 타입이 void, 비동기(Mono<void>), 혹은 null 반환값 인 메서드는 ServerHttpResponse, ServerWebExchange 아규먼트를 갖거나, 혹은 @ResponseStatus 어노테이션이 적용된 경우, 응답 요소 전체를 핸들링한다. 컨트롤러가 낙관적 ETag 또는 lastModified 타임스탬프 체크를 생성한 경우에도 마찬가지이다. <a href="#webflux-caching-etag-lastmodified" target="" class="tx-link" style="color: rgb(0, 85, 255);">Controller</a>에서 더 자세한 정보를 찾을 수 있다. 위 사항에 모두 해당되지 않는 경우, void 반환 타입은 REST 컨트롤러에선 "응답 본문이 없음" 을 의미하고, HTML 컨트롤러에선 디폴트 뷰 이름이 선택된다.</void> |
| Flux<serversentevent>, Observable<serversendevent>, 혹은 이 외 리액티브 타입</serversendevent></serversentevent>                                                                                                                                                                                                                                                                                                                                                        | 서버 전송 이벤트를 발생시킨다. ServerSentEvent 래퍼는 오직 데이터가 작성될 경우에만 생략할 수 있다(그러나 text/event-stream은 반드시 요청되거나 혹은 produces 어트리뷰트 선언을 통해 매핑되어야 한다).                                                                                                                                                                                                                                                                                                                          |
| 이 외의 반환값                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 반환값이 위의 어느 것에도 매칭되지 않을 경우, 기본적으로 String 또는 void(디폴트 뷰 이름 적용) 라면 뷰 이름으로 취급되며, 여기에 해당하지 않으면서 [BeanUtils#isSimpleProperty](<https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/beans/BeanUtils.html#isSimpleProperty-java.lang.Class->)가 단순 타입으로 판단하지 않는다면, 모델로 추기되는 모델 어트리뷰트로 취급된다(리졸빙되지 않은 상태로 남는 경우).                                                                                                                 |



#### 타입 컨버젼

  
스트링 기반 요청 인풋(예: @RequestParam, @RequestHeader, @PathVariable, @MatrixVariable, @CookieValue) 을 나타내는 몇몇 어노테이티드 컨트롤러 메서드 아규먼트들은, 아규먼트가 String 외의 타입으로 선언된 경우 타입 컨버젼을 필요로 한다.  
  
이런 경우 타임 컨버젼은 설정된 타입 컨버터에 기반하여 자동으로 수행된다. 단순 타입(int, long, Date, 기타 등등) 은 기본으로 지원된다. 타입 컨버젼은 WebDataBinder(mvc-ann-initbinder를 보라) 또는 Formatters를 FormattingConversionService([Spring Field Formatting](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#format)을 보라) 와 등록함으로써 통해 커스터마이징 가능하다.  
  

#### 매트릭스 변수(Matrix Variables)

  
[RFC 3986](https://tools.ietf.org/html/rfc3986#section-3.3) 은 경로 세그먼트 안의 이름-값 쌍을 주제로 한다. 스프링 웹플럭스에선 팀 버너스 리의 [옛 포스팅](https://www.w3.org/DesignIssues/MatrixURIs.html)에 근거하여, 이를 "매트릭스 변수" 라 칭한다. 또한 URI 경로 파라미터라 칭하기도 한다.  
  
매트릭스 변수는 어떠한 경로 세그먼트에서도 존재할 수 있다. 각 변수는 세미콜론으로 구분되며, 콤마로 나뉘어진 다수의 값으로 이루어져 있다 - 예: "/cars'color=red,green;year=2012". 다수 값은 반복적인 이름과 함께 지정될 수도 있다 - 예: "color=red;color=green;color=blue".  
  
스프링 MVC 와는 달리, 웹플럭스에서는 URL 에서 매트릭스 변수의 존재 여부는 요청 매핑에 어떠한 영향도 주지 않는다. 다시 말해서, 변수 컨텐츠를 마스킹하기 위해 URI 변수를 사용할 필요는 없다. 그렇지만, 컨트롤러 메서드에서 매트릭스 변수에 접근해야 한다면 URI 변수를 매트릭스 변수가 위치하는 경로 세그먼트에 추가할 필요가 있다. 다음은 그 예제이다:  
  

Java

```java
// GET /pets/42;q=11;r=22

@GetMapping("/pets/{petId}")
public void findPet(@PathVariable String petId, @MatrixVariable int q) {

    // petId == 42
    // q == 11
}
```

Kotlin

```kotlin
// GET /pets/42;q=11;r=22

@GetMapping("/pets/{petId}")
fun findPet(@PathVariable petId: String, @MatrixVariable q: Int) {

    // petId == 42
    // q == 11
}
```

  
주어진 모든 경로 세그먼트는 매트릭스 변수를 포함할 수 있다. 때로는 매트릭스 변수가 어떤 경로 변수의 것인지 구분할 필요가 있을 수 있다. 다음은 그에 대한 예제이다:  
  

Java

```java
// GET /owners/42;q=11/pets/21;q=22

@GetMapping("/owners/{ownerId}/pets/{petId}")
public void findPet(
        @MatrixVariable(name="q", pathVar="ownerId") int q1,
        @MatrixVariable(name="q", pathVar="petId") int q2) {

    // q1 == 11
    // q2 == 22
}
```

Kotlin

```kotlin
@GetMapping("/owners/{ownerId}/pets/{petId}")
fun findPet(
        @MatrixVariable(name = "q", pathVar = "ownerId") q1: Int,
        @MatrixVariable(name = "q", pathVar = "petId") q2: Int) {

    // q1 == 11
    // q2 == 22
}
```

  
선택적인 매트릭스 변수를 기본값과 함께 선언할 수도 있다:  
  

Java

```java
// GET /pets/42

@GetMapping("/pets/{petId}")
public void findPet(@MatrixVariable(required=false, defaultValue="1") int q) {

    // q == 1
}
```

Kotlin

```kotlin
// GET /pets/42

@GetMapping("/pets/{petId}")
fun findPet(@MatrixVariable(required = false, defaultValue = "1") q: Int) {

    // q == 1
}
```

  
MultiValueMap을 사용해서 모든 매트릭스 변수를 가져올 수도 있다:  
  

Java

```java
// GET /owners/42;q=11;r=12/pets/21;q=22;s=23

@GetMapping("/owners/{ownerId}/pets/{petId}")
public void findPet(
        @MatrixVariable MultiValueMap<String, String> matrixVars,
        @MatrixVariable(pathVar="petId") MultiValueMap<String, String> petMatrixVars) {

    // matrixVars: ["q" : [11,22], "r" : 12, "s" : 23]
    // petMatrixVars: ["q" : 22, "s" : 23]
}
```

Kotlin

```kotlin
// GET /owners/42;q=11;r=12/pets/21;q=22;s=23

@GetMapping("/owners/{ownerId}/pets/{petId}")
fun findPet(
        @MatrixVariable matrixVars: MultiValueMap<String, String>,
        @MatrixVariable(pathVar="petId") petMatrixVars: MultiValueMap<String, String>) {

    // matrixVars: ["q" : [11,22], "r" : 12, "s" : 23]
    // petMatrixVars: ["q" : 22, "s" : 23]
}
```

  

#### @RequestParam

  
@RequestParam를 사용하여 컨트롤러에서 쿼리 파라미터를 메서드 아규먼트로 바인딩할 수 있다.  
  

Java

```java
@Controller
@RequestMapping("/pets")
public class EditPetForm {

    // ...

    @GetMapping
    public String setupForm(@RequestParam("petId") int petId, Model model) { (1)
        Pet pet = this.clinic.loadPet(petId);
        model.addAttribute("pet", pet);
        return "petForm";
    }

    // ...
}
```

Kotlin

```kotlin
import org.springframework.ui.set

@Controller
@RequestMapping("/pets")
class EditPetForm {

    // ...

    @GetMapping
    fun setupForm(@RequestParam("petId") petId: Int, model: Model): String { (1)
        val pet = clinic.loadPet(petId)
        model["pet"] = pet
        return "petForm"
    }

    // ...
}
```

  
(1) @RequestParam 사용.  
  
> 서블릿 API "요청 파라미터" 컨셉은 쿼리 파라미터, 폼 데이터, 멀티파트를 하나로 묶는다. 그러나 웹플럭스는 이 각각에 대해 ServerWebExchange를 통해 독립적으로 접근한다. @RequestParam 이 쿼리 파라미터만을 대상으로 하는 것과는 달리, 데이터 바인딩을 사용하여 쿼리 파라미터, 폼 데이터, 멀티파트를 [커맨드 객체](#webflux-ann-modelattrib-method-args)에 적용할 수 있다.  
  
@RequestParam 어노테이션을 사용하는 메서드 파라미터는 기본적으로 필수값이 된다. @RequestParam의 required 플래그를 false로 설정하거나, 아규먼트를 java.util.Optional 래퍼로 선언해서 선택적 파라미터로 지정할 수 있다.  
  
타겟 메서드 파라미터 타입이 String 이 아닐 경우, 타입 컨버젼은 자동으로 적용된다. 
  
@RequestParam 어노테이션이 Map<String, Stirng>이나 MultiValueMap<String, String> 아규먼트에 선언되면, 이 맵에 모든 쿼리 파라미터를 담는다.  
  
@RequestParam 사용은 선택적이다 - 예로, 이 어노테이션에 어트리뷰트를 설정하기 위해 사용할 수 있다. 기본적으로 [BeanUtils#isSimpleProperty](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/beans/BeanUtils.html#isSimpleProperty-java.lang.Class-)로 단순 타입 값으로 판단된 아규먼트이면서, 어떠한 아규먼트 리졸버에 의해서도 리졸빙되지 않은 아규먼트는 @RequestParam 이 적용된 것과 같이 작동한다.  
  

#### @RequestHeader

  
@RequestHeader를 사용하여 컨트롤러에서 요청 헤더를 메서드 아규먼트로 바인딩할 수 있다.  
  
다음은 요청 헤더의 예이다:  
  
[요청헤더](#)  
  
다음 예제는 Accept-Encoding 과 Keep-Alive 헤더의 값을 가져온다:  
  

Java

```java
@GetMapping("/demo")
public void handle(
        @RequestHeader("Accept-Encoding") String encoding, (1)
        @RequestHeader("Keep-Alive") long keepAlive) { (2)
    //...
}
```

Kotlin

```kotlin
@GetMapping("/demo")
fun handle(
        @RequestHeader("Accept-Encoding") encoding: String, (1)
        @RequestHeader("Keep-Alive") keepAlive: Long) { (2)
    //...
}
```

  
(1) Accept-Endocing 헤더의 값을 가져온다. (2) Keep-Alive 헤더의 값을 가져온다.  
  
타겟 메서드 파라미터 타입이 String 이 아닐 경우, 타입 컨버젼은 자동으로 적용된다. 
  
@RequestParam 어노테이션이 Map<String, Stirng> 또는 MultiValueMap<String, String> 아규먼트에 선언되면, 이 맵에 모든 헤더값을 담는다.  
  
> 기본 내장형 컨버터는 컴마로 구분된 문자열을 스트링 배열이나 컬렉션, 혹은 이 외 다른 알려진 타입으로의 컨버젼을 지원한다. 예를 들어, @RequestHeader("Accept") 어노테이션이 적용된 메서드 파라미터는 String 또는 String\[\], List<String> 로 컨버팅 될 수 있다.  
  

#### @CookieValue

  
@CookieValue를 사용하여 HTTP 쿠키를 메서드 아규먼트로 바인딩할 수 있다.  
  
다음은 쿠키 예시이다:  
  
[쿠키](#)  
  
다음은 쿠키값을 가져오는 샘플이다:  
  

Java

```java
@GetMapping("/demo")
public void handle(@CookieValue("JSESSIONID") String cookie) { (1)
    //...
}
```

Kotlin

```kotlin
@GetMapping("/demo")
fun handle(@CookieValue("JSESSIONID") cookie: String) { (1)
    //...
}
```

  
(1) 쿠키값을 가져온다.  
  
타겟 메서드 파라미터 타입이 String 이 아닐 경우, 타입 컨버젼은 자동으로 적용된다. 
  

#### @ModelAttribute

  
@ModelAttribute를 메서드 아규먼트에 적용하여 모델의 어트리뷰트에 접근하거나, 기존 모델이 없는 경우 초기화를 수행하도록 할 수 있다. 이 모델 어트리뷰트는 쿼리 파라미터와 필드 이름과 매칭된 폼 필드들을 덮어쓴다. 이는 데이터 바인딩이라 할 수 있고, 이 동작은 각각의 쿼리 파라미터와 폼 필드를 파싱하고 컨버팅하는 작업으로부터 자유롭게 해준다. 다음은 Pet 인스턴스 바인딩 예제이다:  
  

Java

```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@ModelAttribute Pet pet) { } (1)
```

Kotlin

```kotlin
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
fun processSubmit(@ModelAttribute pet: Pet): String { } (1)
```

  
(1) `Pet` 인스턴스에 바인딩한다.  
  
위 예제의 Pet 인스턴스는 다음과 같이 리졸빙된다.

*   이미 기존 [Model](#webflux-ann-modelattrib-methods)에 존재한다면 모델로부터 얻는다.
*   [@SessionAttribute](#webflux-ann-sessionattributes)을 통해 HTTP 세션으로부터 얻는다.
*   기본 생성자를 실행하여 얻는다.
*   쿼리 파라미터나 폼 필드와 매칭되는 아규먼트를 가진 "주요 생성자"를 실행하여 얻는다. 아규먼트의 이름은 자바빈 @ConstructorProperties 또는 바이트코드의 런타임 파라미터 이름을 통해 확정된다.

  
모델 어트리뷰트 인스턴스를 얻은 뒤, 데이터 바인딩이 적용된다. WebExchangeDataBinder 클래스는 쿼리 파라미터와 폼 필드의 이름을 타겟 Object의 필드 이름과 매칭한다. 매칭 필드 필요에 따라 타임 컨버젼을 적용하여 값을 세팅한다. 데이터 바인딩와 밸리데이션에 관한 더 자세한 정보는 [Validation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#validation)에서 찾을 수 있다. 데이터 바인딩에 관하여는 [DataBinder](#webflux-ann-initbinder)를 보라.  
  
데이터 바인딩에서 에러가 발생할 수 있다. 기본적으로 WebExchangeBindException 이 발생하지만, 컨트롤러 메서드에서 이러한 에러를 체크하기 위해서는 BindingResult 아규먼트를 @ModelAttribute 바로 다음에 선언해야 한다. 다음은 그 예제이다:  
  

Java

```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@ModelAttribute("pet") Pet pet, BindingResult result) { (1)
    if (result.hasErrors()) {
        return "petForm";
    }
    // ...
}
```

Kotlin

```kotlin
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
fun processSubmit(@ModelAttribute("pet") pet: Pet, result: BindingResult): String { (1)
    if (result.hasErrors()) {
        return "petForm"
    }
    // ...
}
```

  
(1) `BindingResult`를 추가한다.  
  
javax.validation.Valid 어노테이션이나 스프링의 @Validated 어노테이션을 추가하여 데이터 바인딩 뒤 자동 벨리데이션을 적용할 수 있다([Bean Validation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#validation-beanvalidation) 및 [Spring validation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#validation)을 보라). 다음은 @Valid 어노테이션의 사용 예이다:  
  

Java

```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@Valid @ModelAttribute("pet") Pet pet, BindingResult result) { (1)
    if (result.hasErrors()) {
        return "petForm";
    }
    // ...
}
```

Kotlin

```kotlin
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
fun processSubmit(@Valid @ModelAttribute("pet") pet: Pet, result: BindingResult): String { (1)
    if (result.hasErrors()) {
        return "petForm"
    }
    // ...
}
```

  
(1) `@Valid`를 모델 어트리뷰트 아규먼트에 적용한다.  
  
스프링 MVC 와는 달리, 스프링 웹플럭스는 모델에서 리액티브 타입을 지원한다 - 예: Mono<Account>, io.reactivex.Single<Account>. @ModelAttribute 아규먼트를 리액티브 타입 래퍼와 함께 사용하거나 사용하지 않거나 하면 필요에 따라 그에 맞게 실제 값으로 리졸빙된다. 하지만 위의 예제에서처럼 BindingResult 아규먼트는 반드시 위치 상 @ModelAttribute 아규먼트 직후에, 리액티브 타입 래퍼 없이 사용해야 한다. 그게 아니라면 아래와 같이 리액티브 타입을 통해 에러 핸들링을 수행할 수 있다:  
  

Java

```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public Mono<String> processSubmit(@Valid @ModelAttribute("pet") Mono<Pet> petMono) {
    return petMono
        .flatMap(pet -> {
            // ...
        })
        .onErrorResume(ex -> {
            // ...
        });
}
```

Kotlin

```kotlin
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
fun processSubmit(@Valid @ModelAttribute("pet") petMono: Mono<Pet>): Mono<String> {
    return petMono
            .flatMap { pet ->
                // ...
            }
            .onErrorResume{ ex ->
                // ...
            }
}
```

  
@ModelAttribute 사용은 선택적이다 - 예로, 이 어노테이션에 어트리뷰트를 설정하기 위해 사용할 수 있다. 기본적으로 [BeanUtils#isSimpleProperty](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/beans/BeanUtils.html#isSimpleProperty-java.lang.Class-)로 단순 타입 값이 아닌 것으로 판단된 아규먼트이면서, 어떠한 아규먼트 리졸버에 의해서도 리졸빙되지 않은 아규먼트는 @ModelAttribute가 적용된 것과 같이 작동한다.  
  

#### @SessionAttributes

  
@SessionAttributes는 요청 간 모델 어트리뷰트를 WebSession 에 저장하기 위해 사용된다. 타입 레벨 어노테이션으로, 특정 컨트롤러에 의해 사용되며 세션 어트리뷰트를 선언한다. 보통 이어지는 요청에서의 접근을 위해, 세션에 그대로 저장되어야 하는 모델 어트리뷰트의 이름이나 타입을 나열한다.  
  
다음 예제를 보자:  
  

Java

```java
@Controller
@SessionAttributes("pet") (1)
public class EditPetForm {
    // ...
}
```

Kotlin

```kotlin
@Controller
@SessionAttributes("pet") (1)
class EditPetForm {
    // ...
}
```

  
(1) `@SessionAttributes` 어노테이션을 적용한다.  
  
최초 요청에서, 모델 어트리뷰트가 이름 pet으로 모델에 추가된다. 이 모델 어트리뷰트는 자동으로 WebSession 에 저장된다. 이 모델은 다른 컨트롤러 메서드가 SessionStatus 메서드 아규먼트로 세션 저장소를 클리어하기 전까지 남아 있는다. 다음은 그 예제이다:  
  

Java

```java
@Controller
@SessionAttributes("pet") (1)
public class EditPetForm {

    // ...

    @PostMapping("/pets/{id}")
    public String handle(Pet pet, BindingResult errors, SessionStatus status) { (2)
        if (errors.hasErrors()) {
            // ...
        }
            status.setComplete();
            // ...
        }
    }
}
```

Kotlin

```kotlin
@Controller
@SessionAttributes("pet") (1)
class EditPetForm {

    // ...

    @PostMapping("/pets/{id}")
    fun handle(pet: Pet, errors: BindingResult, status: SessionStatus): String { (2)
        if (errors.hasErrors()) {
            // ...
        }
        status.setComplete()
        // ...
    }
}
```

  
(1) `@SessionAttributes` 어노테이션을 적용한다. (2) `SessionStatus` 변수를 사용한다.  
  

#### @SessionAttribute

  
전역적으로 관리되는(컨트롤러 바깥에서 - 예: 필터) 기존 세션 어트리뷰트로 접근해야 하고, 그 존재 여부가 확실치 않다면, @SessionAttribute 어느테이션을 메서드 파라미터에 적용할 수 있다:  
  

Java

```java
@GetMapping("/")
public String handle(@SessionAttribute User user) { (1)
    // ...
}
```

Kotlin

```kotlin
@GetMapping("/")
fun handle(@SessionAttribute user: User): String { (1)
    // ...
}
```

  
(1) `@SessionAttribute` 어노테이션을 적용한다.  
  
세션 어트리뷰트를 추가하거나 제거하는 경우, WebSession을 컨트롤러에 주입할 것을 고려해볼 수 있다.  
  
컨트롤러의 워크플로우의 일부로서 세션에 모델 어트리뷰트를 임시 저장하려면 SessionAttribute를 사용할 수 있다. [@SessionAttribute](#webflux-ann-sessionattributes)에 설명되어 있다.  
  

#### @RequestAttribute

  
@SessionAttribute와 유사하게, @RequestAttribute를 사용하여 이전에 생성된 기존 요청 어트리뷰트에 접근할 수 있다(예: WebFilter 에서 생성한). 다음은 그 예제이다:  
  

Java

```java
@GetMapping("/")
public String handle(@RequestAttribute Client client) { (1)
    // ...
}
```

Kotlin

```kotlin
@GetMapping("/")
fun handle(@RequestAttribute client: Client): String { (1)
    // ...
}
```

  
(1) `@RequestAttribute`를 적용한다.  
  

#### 멀트파트 컨텐츠

  
[Multipart Data](#멀티파트-데이터)에서 설명된대로, ServerWebExchange는 멀티파트 컨텐츠에 접근할 수 있다. 컨트롤러에서 파일 업로드 폼을 핸들링하는 가장 최적의 방법은 [커맨드 객체](#webflux-ann-modelattrib-method-args) 로 데이터 바인딩하는 것이다. 다음은 그 예제이다:  
  

Java

```java
class MyForm {

    private String name;

    private MultipartFile file;

    // ...

}

@Controller
public class FileUploadController {

    @PostMapping("/form")
    public String handleFormUpload(MyForm form, BindingResult errors) {
        // ...
    }

}
```

Kotlin

```kotlin
class MyForm(
        val name: String,
        val file: MultipartFile)

@Controller
class FileUploadController {

    @PostMapping("/form")
    fun handleFormUpload(form: MyForm, errors: BindingResult): String {
        // ...
    }

}
```

  
RESTful 서비스 시나리오의 브라우저가 아닌 클라이언트로부터의 멀티파트 요청을 전송할 수 있다. 다음은 파일과 JSON을 요청에 함께 사용한 예제이다:  
  
[요청](#)  
  
@RequestPart로 각 파트에 접근할 수 있다:  
  

Java

```java
@PostMapping("/")
public String handle(@RequestPart("meta-data") Part metadata, (1)
        @RequestPart("file-data") FilePart file) { (2)
    // ...
}
```

Kotlin

```kotlin
@PostMapping("/")
fun handle(@RequestPart("meta-data") Part metadata, (1)
        @RequestPart("file-data") FilePart file): String { (2)
    // ...
}
```

  
(1) `@RequestPart`로 metadata를 얻는다. (2) `@RequestPart`로 file을 얻는다.  
  
원본 파트 컨텐츠를 디시리얼라이징하기 위해(예: JSON으로 - @RequestBody와 유사), Part 대신 구체적인 타겟 Object를 선언할 수 있다:  
  

Java

```java
@PostMapping("/")
public String handle(@RequestPart("meta-data") MetaData metadata) { (1)
    // ...
}
```

Kotlin

```kotlin
@PostMapping("/")
fun handle(@RequestPart("meta-data") metadata: MetaData): String { (1)
    // ...
}
```

  
(1) `@RequestPart`로 `metadata`를 얻는다.  
  
@RequestPart와 javax.validation.Valid 또는 스프링의 @Validated를 함께 사용할 수 있다. javax.validation.Valid와 @Validated는 표준 빈 밸리데이션이 적용된다. 기본적으로 밸리데이션 에러는 WebExchangeBindException을 발생시킨다. 이 익셉션은 400(BAD\_REQUEST) 응답이 된다. 그렇지 않으면, 컨트롤러 안에서 Errors 또는 BindingResult 아규먼트로 밸리데이션 에러를 핸들링할 수 있다:  
  

Java

```java
@PostMapping("/")
public String handle(@Valid @RequestPart("meta-data") Mono<MetaData> metadata) {
    // use one of the onError* operators...
}
```

Kotlin

```kotlin
@PostMapping("/")
fun handle(@Valid @RequestPart("meta-data") metadata: MetaData): String {
    // ...
}
```

  
@RequestBody를 사용하여 멀티파트 데이터 전체를 MultiValueMap으로 접근할 수 있다:  
  

Java

```java
@PostMapping("/")
public String handle(@RequestBody Mono<MultiValueMap<String, Part>> parts) { (1)
    // ...
}
```

Kotlin

```kotlin
@PostMapping("/")
fun handle(@RequestBody parts: MultiValueMap<String, Part>): String { (1)
    // ...
}
```

  
(1) `@RequestBody`를 적용한다.  
  
@RequestBody와 Flux<Part>(코틀린에선 Flow<Part>)를 사용하여 멀티파트 데이터를 순차적으로, 스트리밍 방식으로 접근할 수 있다:  
  

Java

```java
@PostMapping("/")
public String handle(@RequestBody Flux<Part> parts) { (1)
    // ...
}
```

Kotlin

```kotlin
@PostMapping("/")
fun handle(@RequestBody parts: Flow<Part>): String { (1)
    // ...
}
```

  
(1) `@RequestBody`를 적용한다.  
  

#### @RequestBody

  
@RequestBody를 사용하여 요청 본문을 읽고 Object로 디시리얼라이징할 수 있다. 내부적으로 [HttpMessageReader](#125-코덱)를 사용한다:  
  

Java

```java
@PostMapping("/accounts")
public void handle(@RequestBody Account account) {
    // ...
}
```

Kotlin

```kotlin
@PostMapping("/accounts")
fun handle(@RequestBody account: Account) {
    // ...
}
```

  
스프링 MVC 와는 달리, 웹플럭스에서는 @RequestBody 메서드 아규먼트는 리액티브 타입과 완전한 논 블로킹 읽기,(클라이언트에서 서버로) 스트리밍을 지원한다.  
  

Java

```java
@PostMapping("/accounts")
public void handle(@RequestBody Mono<Account> account) {
    // ...
}
```

Kotlin

```kotlin
@PostMapping("/accounts")
fun handle(@RequestBody accounts: Flow<Account>) {
    // ...
}
```

  
[WebFlux Config](#111-웹플럭스-설정webflux-config-message-codecs) 의 [HTTP message codec](#111-웹플럭스-설정webflux-config) 옵션을 사용하여 메시지 리더(readers)를 설정하거나 커스터마이징할 수 있다.  
  
@RequestBody와 javax.validation.Valid 또는 스프링의 @Validated를 함께 사용할 수 있다. javax.validation.Valid와 @Validated는 표준 빈 밸리데이션이 적용된다. 기본적으로 밸리데이션 에러는 WebExchangeBindException을 발생시킨다. 이 익셉션은 400(BAD\_REQUEST) 응답이 된다. 그렇지 않으면, 컨트롤러 안에서 Errors 또는 BindingResult 아규먼트로 밸리데이션 에러를 핸들링할 수 있다:  
  

Java

```java
@PostMapping("/accounts")
public void handle(@Valid @RequestBody Mono<Account> account) {
    // use one of the onError* operators...
}
```

Kotlin

```kotlin
@PostMapping("/accounts")
fun handle(@Valid @RequestBody account: Mono<Account>) {
    // ...
}
```

  

#### HttpEntity

HttpEntity는 [@RequestBody](#webflux-ann-requestbody)를 사용하는 것과 거의 동일하지만, HttpEntity는 요청 헤더와 본문을 노출하는 컨테이너 객체에 기반한다. 다음은 HttpEntity 사용 예제이다:  
  

Java

```java
@PostMapping("/accounts")
public void handle(HttpEntity<Account> entity) {
    // ...
}
```

Kotlin

```kotlin
@PostMapping("/accounts")
fun handle(entity: HttpEntity<Account>) {
    // ...
}
```

  

#### @ResponseBody

  
@ResponseBody를 메서드에 적용하여 반환값을 시리얼라이징하고 응답 본문에 작성할 수 있다. 내부적으로 [HttpMessageWriter](#125-코덱)를 사용한다:  
  

Java

```java
@GetMapping("/accounts/{id}")
@ResponseBody
public Account handle() {
    // ...
}
```

Kotlin

```kotlin
@GetMapping("/accounts/{id}")
@ResponseBody
fun handle(): Account {
    // ...
}
```

  
@ResponseBody를 클래스 레벨에 적용하여 컨트롤러 안의 모든 메서드에 공통 적용할 수도 있다. 이는 @RestController의 효과와 동일하다. @Controller와 @ResponseBody를 메타 어노테이션으로 적용하는 것과 같다.  
  
@ResponseBody는 리액티브 타입을 지원한다. Reactor 또는 RxJava 타입을 반환할 수 있고, 리액티브 타입이 생성하는 값을 비동기로 응답에 작성할 수 있다. 더 자세한 내용은 [Streaming](#125-코덱-streaming)과 [JSON rendering](#125-코덱-jackson)에서 다룬다.  
  
@ResponseBody 메서드를 JSON 시리얼라이징 뷰와 함께 사용할 수 있다. 자세한 내용은 [Jackson JSON](#webflux-ann-jackson)를 보라.  
  
[WebFlux Config](#111-웹플럭스-설정webflux-config-message-codecs) 의 [HTTP message codecs](#111-웹플럭스-설정webflux-config) 옵션을 사용하여 메시지 작성을 설정하고 커스터마이징할 수 있다.  
  

#### ResponseEntity

  
ResponseEntity는 [@ResponseBody](#webflux-ann-responsebody)와 비슷하지만, 상태(status)와 헤더를 가지고 있다:  
  

Java

```java
@GetMapping("/something")
public ResponseEntity<String> handle() {
    String body = ... ;
    String etag = ... ;
    return ResponseEntity.ok().eTag(etag).build(body);
}
```

Kotlin

```kotlin
@GetMapping("/something")
fun handle(): ResponseEntity<String> {
    val body: String = ...
    val etag: String = ...
    return ResponseEntity.ok().eTag(etag).build(body)
}
```

  
웹플럭스는 ResponseEntity를 비동기로 생성하기 위한 단일 값 [리액티브 타입](#webflux-reactive-libraries)을 지원한다. 그리고/또는 단일과 다수 값 티액티브 타입을 본문에 사용할 수 있다.  
  

#### Jackson JSON

  
스프링은 Jackson JSON 라이브러리를 지원한다.  
  
JSON Views  
  
스프링 웹플럭스는 내장형 [Jackson's Serialization Views](https://www.baeldung.com/jackson-json-view-annotation)를 제공한다. Object의 필드 중 일부만을 렌더링할 수 있다. @ResponseBody 또는 ResponseEntity 컨트롤러 메서드와 함께 사용하기 위해서는 Jackson's @JsonView를 사용할 수 있다. 이 어노테이션으로 시리얼라이징 뷰 클래스를 활성화한다. 다음은 그 예제이다:  
  

Java

```java
@RestController
public class UserController {

    @GetMapping("/user")
    @JsonView(User.WithoutPasswordView.class)
    public User getUser() {
        return new User("eric", "7!jd#h23");
    }
}

public class User {

    public interface WithoutPasswordView {};
    public interface WithPasswordView extends WithoutPasswordView {};

    private String username;
    private String password;

    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    @JsonView(WithoutPasswordView.class)
    public String getUsername() {
        return this.username;
    }

    @JsonView(WithPasswordView.class)
    public String getPassword() {
        return this.password;
    }
}
```

Kotlin

```kotlin
@RestController
class UserController {

    @GetMapping("/user")
    @JsonView(User.WithoutPasswordView::class)
    fun getUser(): User {
        return User("eric", "7!jd#h23")
    }
}

class User(
        @JsonView(WithoutPasswordView::class) val username: String,
        @JsonView(WithPasswordView::class) val password: String
) {
    interface WithoutPasswordView
    interface WithPasswordView : WithoutPasswordView
}
```

  
> @JsonView는 뷰 클래스 지정 시 배열을 허용하지만, 한 컨트롤러 메서드 당 하나의 뷰만 지정할 수 있다. 다수의 뷰를 활성화하려면 컴포짓 인터페이스를 사용하라.  
  

## 1.4.4. Model

@ModelAttribute를 다음과 같이 사용할 수 있다:

*   @RequestMapping 메서드의 [메서드 아규먼트](#webflux-ann-modelattrib-method-args)에 적용하여 모델로부터의 Object를 생성하거나 접근하고, WebDataBinder를 통해 이를 요청에 바인딩한다.
*   @Controller 또는 @ControllerAdvice 클래스의 메서드 레벨 어노테이션으로 적용하여 @RequestMapping 메서드 실행 전 모델 초기화 동작을 수행하도록 한다.
*   @RequestMapping 메서드에 적용하여 이 메서드의 반환값이 모델 어트리뷰트임을 표시한다.

  
이 섹션은 @ModelAttribute 메서드나, 위 목록의 두 번째 - 메서드 레벨 어노테이션을 주제로 한다. 컨트롤러는 @ModelAttribute 메서드를 몇 개든 가질 수 있다. 이 메서드들은 같은 컨트롤러 안의 @RequestMapping 메서드가 실행되기 전에 먼저 실행된다. @ModelAttribute 메서드는 @ControllerAdvice를 통해 컨트롤러 간 공유되어 사용될 수 있다. 더 자세한 내용은 [Controller Advice](#webflux-ann-controller-advice)를 보라.  
  
@ModelAttribute 메서드는 유연한 시그니처를 갖는다. @RequestMapping 메서드와 동일한 아규먼트를 다수 지원한다(@ModelAttribute 자체는 는 요청 본문과 무관하다는 점을 제외하고).  
  
다음은 @ModelAttribute 메서드 예제이다:  
  

Java

```java
@ModelAttribute
public void populateModel(@RequestParam String number, Model model) {
    model.addAttribute(accountRepository.findAccount(number));
    // add more ...
}
```

Kotlin

```kotlin
@ModelAttribute
fun populateModel(@RequestParam number: String, model: Model) {
    model.addAttribute(accountRepository.findAccount(number))
    // add more ...
}
```

  
다음 예제는 한 어트리뷰트만 추가한다:  
  

Java

```java
@ModelAttribute
public Account addAccount(@RequestParam String number) {
    return accountRepository.findAccount(number);
}
```

Kotlin

```kotlin
@ModelAttribute
fun addAccount(@RequestParam number: String): Account {
    return accountRepository.findAccount(number);
}
```

  
> @ModelAttribute의 이름이 명시적으로 지정되지 않은 경우, [Convention](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/core/Conventions.html) 자바독에 기술된 내용에 근거한 디폴트 이름이 선택된다. 오버로딩된 addAttribute 메서드나 @ModelAttribute의 name 어트리뷰트를 통해 언제나 명시적 이름을 지정할 수 있다(반환값에 대한).  
  
스프링 MVC와 달리, 스프링 웹플럭스는 모델에서의 리액티브 타입을 지원한다(예: Mono<Account>, io.reactivex.Single<Account>). 이런 비동기 모델 어트리뷰트는 @RequestMapping 메서드의 실행 시점에 실제 값으로 투명하게 리졸빙된다(그리고 모델이 갱신된다). @RequestMapping 메서드의 @ModelAttribute 아규먼트는 래퍼 없이 실제 타입으로 선언된다. 다음은 그 예제이다:  
  

Java

```java
@ModelAttribute
public void addAccount(@RequestParam String number) {
    Mono<Account> accountMono = accountRepository.findAccount(number);
    model.addAttribute("account", accountMono);
}

@PostMapping("/accounts")
public String handle(@ModelAttribute Account account, BindingResult errors) {
    // ...
}
```

Kotlin

```kotlin
import org.springframework.ui.set

@ModelAttribute
fun addAccount(@RequestParam number: String) {
    val accountMono: Mono<Account> = accountRepository.findAccount(number)
    model["account"] = accountMono
}

@PostMapping("/accounts")
fun handle(@ModelAttribute account: Account, errors: BindingResult): String {
    // ...
}
```

  
추가로, 리액티브 타입 래퍼를 가진 모델 어트리뷰트는 뷰 렌더링 바로 전에 실제 값으로 리졸빙된다(그리고 모델이 갱신된다).  
  
@RequestMapping 메서드의 반환값을 모델 어트리뷰트로 해석하는 경우, @ModelAttribute를 @RequestMapping 메서드의 메서드 레벨 어노테이션으로 적용할 수도 있다. HTML 컨트롤러에서는 이것이 반환값이 뷰 이름이 되는 String 이 아닐 때의 기본 동작이기 때문에 일반적으로는 필요치 않다. @ModelAttribute를 사용하여 모델 어트리뷰트의 이름을 커스터마이징할 수도 있다. 다음은 그 예제이다:  
  

Java

```java
@GetMapping("/accounts/{id}")
@ModelAttribute("myAccount")
public Account handle() {
    // ...
    return account;
}
```

Kotlin

```kotlin
@GetMapping("/accounts/{id}")
@ModelAttribute("myAccount")
fun handle(): Account {
    // ...
    return account
}
```

  

## 1.4.5. DataBinder

@Controller, @ControllerAdvice 클래스는 @InitInder 메서드로 WebDataBinder 인스턴스를 초기화할 수 있다. 이 인스턴스는 아래와 같이 사용된다:

*   요청 파라미터(폼 데이터나 쿼리)를 모델 객체에 바인딩한다.
*   String 기반 요청 값(요청 파라미터, 경로 변수, 헤더, 쿠키, 기타 등등) 을 타겟 컨트롤러 메서드 아규먼트 타입으로 컨버팅한다.
*   HTML 폼 렌더링 시 모델 객체값들을 String 값으로 포맷팅한다.

  
@InitBinder 메서드는 컨트롤러 특징적인 java.bean.PropertyEditor 혹은 스프링 Converter와 Formatter 컴포넌트롤 등록할 수 있다. 추가로 [WebFlux Java configuration](#111-웹플럭스-설정webflux-config-conversion)를 사용하여 Converter와 Formatter 타입을 전역적으로 사용되는 FormattingConversionService 에 등록할 수 있다.  
  
@InitBinder 메서드는 @RequestMapping 메서드와 동일한 아규먼트를 다수 지원한다(@ModelAttribute(커맨드 객체)를 제외하고). 일반적으로 아규먼트는 컴포넌트 등록을 위해 WebDataBinder 아규먼트와 함께 void 반환값으로 선언된다. 다음은 @InitBinder 사용 예제이다:  
  

Java

```java
@Controller
public class FormController {

    @InitBinder (1)
    public void initBinder(WebDataBinder binder) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        dateFormat.setLenient(false);
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
    }

    // ...
}
```

Kotlin

```kotlin
@Controller
class FormController {

    @InitBinder (1)
    fun initBinder(binder: WebDataBinder) {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd")
        dateFormat.isLenient = false
        binder.registerCustomEditor(Date::class.java, CustomDateEditor(dateFormat, false))
    }

    // ...
}
```

  
(1) `@InitBinder`를 적용한다.  
  
다른 방법으로는, 전역 FormattingConversionService를 통한 Formatter 기반 설정 사용 시, 같은 방식을 재사용하며 컨트롤러 특징적 Formatter 인스턴스를 등록할 수 있다. 다음은 그 예제이다:  
  

Java

```java
@Controller
public class FormController {

    @InitBinder
    protected void initBinder(WebDataBinder binder) {
        binder.addCustomFormatter(new DateFormatter("yyyy-MM-dd")); (1)
    }

    // ...
}
```

Kotlin

```kotlin
@Controller
class FormController {

    @InitBinder
    fun initBinder(binder: WebDataBinder) {
        binder.addCustomFormatter(DateFormatter("yyyy-MM-dd")) (1)
    }

    // ...
}
```

  
(1) 커스텀 포맷터를 추가한다(여기서는 `DataFormatter`를 사용했다).  
  

## 1.4.6. 익셉션 관리

@Controller, [@ControllerAdvice](#mvc-ann-controller-advice) 클래스는 @ExceptionHandler 메서드로 컨트롤러 메서드에서 발생한 익셉션을 핸들링할 수 있다. 다음은 그 예제이다:  
  

Java

```java
@Controller
public class SimpleController {

    // ...

    @ExceptionHandler (1)
    public ResponseEntity<String> handle(IOException ex) {
        // ...
    }
}
```

Kotlin

```kotlin
@Controller
class SimpleController {

    // ...

    @ExceptionHandler (1)
    fun handle(ex: IOException): ResponseEntity<String> {
        // ...
    }
}
```

  
(1) `@ExceptionHandler`를 적용한다.  
  
익셉션 아규먼트는 전파된 익셉션의 최상위 레벨 익셉션과 매칭할 수 있다(예제의 IOException). 혹은 최상위 레벨 래퍼 익셉션의 원인이 되는 익셉션과도 매칭할 수 있다(예: IOException으로 래핑된 IllegalStateException).  
  
위 예제에서와 같이, 매칭 익셉션 타입으로는 가급적 타겟 익셉션을 메서드 아규먼트로 선언하는 것이 좋다. 아니면 어노테이션을 선언하여 매칭 익셉션 범위를 좁힐 수도 있다. 최대한 구체적인 익섹션을 아규먼트 시그니처에 사용하여 주요한 루트 익셉션 매핑을 상응하는 순서에 맞는 @ControllerAdvice 에 선언할 것을 권한다. 더 자세한 정보는 [MVC 섹션](#mvc-ann-exceptionhandler)에서 다룬다.  
  
> 웹플럭스의 @ExceptionHandler 메서드는 요청 본문의 익셉션과 @ModelAttribute 관련 메서드 아규먼트로 @RequestMapping 메서드와 같은 메서드 아규먼트와 반환값을 지원한다.  
  

#### REST API 익셉션

  
REST 서비스의 공통 요건은 응답 본문에 상세한 에러 내용을 포함하는 것이다. 스프링 프레임워크는 이 작업을 자동으로 해주지 않기 때문에, 응답 본문의 상세한 에러 내용 표시는 어플리케이션에 특징적이다. 하지만 @RestController는 @ExceptionHandler 메서드를 ResponseEntity 반환값과 함께 사용하여 상태 코드와 응답 본문을 작성할 수 있다. 이런 메서드는 @ControllerAdvice 클래스에도 선언되어 전역적인 적용이 가능하다.  
  
> 스프링 웹플럭스는 스프링 MVC의 ResponseEntityExceptionHandler와 같은 컴포넌트를 제공하지 않는다. 왜냐하면 웹플럭스에서 발생하는 익셉션은 모두 ResponseStatusException(혹은 이것의 서브클래스) 이고, 이 익셉션들은 HTTP 상태 코드로 해석될 필요가 없기 때문이다.  
  

## 1.4.7. 컨트롤러 어드바이스(Controller Advice)

보통 @ExceptionHandler, @InitBinder, @ModelAttribute 메서드는 자신이 선언된 @Controller 클래스(혹은 클래스 계층) 안에서 적용된다. 클래스에 @ControllerAdvice 또는 @RestControllerAdvice를 적용하면 이런 메서드들을 더 넓은 범위로(컨트롤러 간) 적용할 수 있다.  
  
@ControllerAdvice는 @Component와 함께 적용된다. 이는 컨트롤러 어드바이스 클래스는 [컴포넌트 스캐닝](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#beans-java-instantiating-container-scan)을 통해 스프링 빈으로 등록될 수 있음을 의미한다. @RestControllerAdvice는 컴포즈드 어노테이션으로, @ControllerAdvice와 @ResponseBody를 함께 적용한다. 이것은 곧 @ExceptionHandler 메서드가 메시지 컨버팅을 통해 응답 본문으로 작성된다는 뜻이다(뷰 리솔루션이나 템플릿 렌더링에 대응한다).  
  
어플리케이션 시작 시에 @RequestMapping 과 @ExceptionHandler 메서드의 기반 클래스들이 @ControllerAdvice가 적용된 스프링 빈을 감지하고, 이 메서드들을 런타임에 적용한다. 전역 @ExceptionHandler 메서드(@ControllerAdvice 에서 선언된)는 지역 @ExceptionHandler 메서드(@Controller 에서 선언된)가 적용된 다음에 적용된다. 이와 반대로 전역 @ModelAttribute, @InitBinder 메서드들은 지역 메서드들이 적용되기 전에 먼저 적용된다.  
  
기본적으로, @ControllerAdvice 메서드는 모든 요청에 적용되지만(모든 컨트롤러에 적용), 어노테이션에 어트리뷰트를 사용하여 컨트롤러 적용 범위를 좁힐 수 있다. 다음은 그 예제이다:  
  

Java

```java
// Target all Controllers annotated with @RestController
@ControllerAdvice(annotations = RestController.class)
public class ExampleAdvice1 {}

// Target all Controllers within specific packages
@ControllerAdvice("org.example.controllers")
public class ExampleAdvice2 {}

// Target all Controllers assignable to specific classes
@ControllerAdvice(assignableTypes = {ControllerInterface.class, AbstractController.class})
public class ExampleAdvice3 {}
```

Kotlin

```kotlin
// Target all Controllers annotated with @RestController
@ControllerAdvice(annotations = [RestController::class])
public class ExampleAdvice1 {}

// Target all Controllers within specific packages
@ControllerAdvice("org.example.controllers")
public class ExampleAdvice2 {}

// Target all Controllers assignable to specific classes
@ControllerAdvice(assignableTypes = [ControllerInterface::class, AbstractController::class])
public class ExampleAdvice3 {}
```

  
위 예제의 컨트롤러 셀렉터는 런타임에 평가되기 때문에, 광범위하게 사용될 경우 성능에 부정적인 영향을 줄 수 있다. [ControllerAdvice](#) 자바독에서 더 자세한 정보를 찾을 수 있다.  
  

## 1.5. 함수형 엔드포인트(Functional Endpoints)

스프링 웹플럭스는 WebFlux.fn를 포함한다. WebFlux.fn은 경량 함수형 프로그래밍 모델으로, 함수는 요청을 라우팅하고 핸들링하며, 각 요소는 불변형(immutable)이다. 어노테이션 기반 프로그래밍 모델의 대체제인 동시에 동일한 [Reactive Core](#webflux-reactive-spring-web) 기반 위에 작동한다.  
  

## 1.5.1. 개요

WebFlux.fn 에서 HTTP 요청은 HandlerFunction으로 핸들링한다: ServerRequest 아규먼트를 가지며, 지연된 ServerResponse를 반환한다(Mono). 요청과 응답 객체 모두 불변형이며 HTTP 요청과 응답에의 접근에 있어 자바 8 에 친화적인 방식을 제공한다. HandlerFunction은 어노테이션 기반 프로그래밍 모델의 @RequestMapping 메서드의 본문와 동등하다.  
  
RouterFunction은 들어오는 요청을 핸들러 함수로 라우팅한다: ServerRequest 아규먼트를 가지며, 지연된 HandlerFunction을 반환한다(Mono). 라우터 함수가 매칭되면 핸들러 함수를 반환한다. 매칭되지 않으면 빈 Mono를 반환한다. RouterFunction은 @RequestMapping 어노테이션과 동등하지만, 라우터 함수가 제공하는 큰 차이점은 데이터가 아닌 그 동작에 있다.  
  
RouterFunctions.route() 는 라우터를 생성하는 라우터 빌더를 제공한다. 다음은 그 예제이다:  
  

Java

```java
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.web.reactive.function.server.RequestPredicates.*;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;

PersonRepository repository = ...
PersonHandler handler = new PersonHandler(repository);

RouterFunction<ServerResponse> route = route()
    .GET("/person/{id}", accept(APPLICATION_JSON), handler::getPerson)
    .GET("/person", accept(APPLICATION_JSON), handler::listPeople)
    .POST("/person", handler::createPerson)
    .build();


public class PersonHandler {

    // ...

    public Mono<ServerResponse> listPeople(ServerRequest request) {
        // ...
    }

    public Mono<ServerResponse> createPerson(ServerRequest request) {
        // ...
    }

    public Mono<ServerResponse> getPerson(ServerRequest request) {
        // ...
    }
}
```

Kotlin

```kotlin
val repository: PersonRepository = ...
val handler = PersonHandler(repository)

val route = coRouter { (1)
    accept(APPLICATION_JSON).nest {
        GET("/person/{id}", handler::getPerson)
        GET("/person", handler::listPeople)
    }
    POST("/person", handler::createPerson)
}


class PersonHandler(private val repository: PersonRepository) {

    // ...

    suspend fun listPeople(request: ServerRequest): ServerResponse {
        // ...
    }

    suspend fun createPerson(request: ServerRequest): ServerResponse {
        // ...
    }

    suspend fun getPerson(request: ServerRequest): ServerResponse {
        // ...
    }
}
```

  
RouterFunction을 가동하는 방법 하나는 이를 HttpHandler로 변경하고 내장형 [서버 어댑터](#121-httphandler)를 통해 설치하는 것이다.

*   RouterFunctions.toHttpHandler(RouterFunction)
*   RouterFunctions.toHttpHandler(RouterFunction, HandlerStrategies)

  
대부분의 어플리케이션은 웹플럭스 자바 설정을 통해 실행할 수 있다. [Running a Server](#)를 보라.  
  

## 1.5.2. HandlerFunction

ServerRequest, ServerResponse는 불변형 인터페이스로, JDK 8 에 친숙한 HTTP 요청과 응답 접근법을 제공한다. 요청과 응답은 본문 스트림에 대한 [Reactive Streams](#webflux-fn-running) 백프레셔를 제공한다. 요청 본문은 리액터 Flux 또는 Mono로 표현된다. 응답 본문은 Flux와 Mono를 포함하는 리액티브 스트림 Publisher로 표현된다. 더 자세한 내용은 [리액티브 라이브러리](#webflux-reactive-libraries)를 보라.  
  

#### ServerRequest

  
ServerRequest는 HTTP 메서드, URI, 헤더, 쿼리 파라미터에의 접근을 제공하며, 본문에의 접근은 body 메서드를 통해 이루어진다.  
  
다음 예제는 요청 본문을 Mono<String>으로 추출한다:  
  

Java

```java
Mono<String> string = request.bodyToMono(String.class);
```

Kotlin

```kotlin
val string = request.awaitBody<String>()
```

  
다음 예제는 본문을 Flux<Person>(코틀린은 Flow) 로 추출한다. Person 객체는 JSON 또는 XML 처럼 시리얼라이징된 폼으로부터 디코딩된다.  
  

Java

```java
Flux<Person> people = request.bodyToFlux(Person.class);
```

Kotlin

```kotlin
val people = request.bodyToFlow<Person>()
```

  
위의 예제는 더 일반적인 ServerRequest.body(BodyExtractor) 사용 예이다. ServerRequest.body(BodyExtractor) 는 BodyExtractor 함수형 전략(strategy) 인터페이스를 받는다. 유틸리티 클래스 BodyExtractors는 다량의 인스턴스에의 접근을 제공한다. 예로, 위 예제는 아래와 같이 작성될 수 있다:  
  

Java

```java
Mono<String> string = request.body(BodyExtractors.toMono(String.class));
Flux<Person> people = request.body(BodyExtractors.toFlux(Person.class));
```

Kotlin

```kotlin
    val string = request.body(BodyExtractors.toMono(String::class.java)).awaitFirst()
    val people = request.body(BodyExtractors.toFlux(Person::class.java)).asFlow()
```

  
다음 예제는 폼 데이터에 접근한다:  
  

Java

```java
Mono<MultiValueMap<String, String> map = request.formData();
```

Kotlin

```kotlin
val map = request.awaitFormData()
```

  
다음 예제는 맵 방식으로 멀티파트 데이터에 접근한다:  
  

Java

```java
Mono<MultiValueMap<String, Part> map = request.multipartData();
```

Kotlin

```kotlin
val map = request.awaitMultipartData()
```

  
다음 예제는 멀트파트에 한 번에 하나씩, 스트리밍 방식으로 접근한다:  
  

Java

```java
Flux<Part> parts = request.body(BodyExtractors.toParts());
```

Kotlin

```kotlin
val parts = request.body(BodyExtractors.toParts()).asFlow()
```

  

#### ServerResponse

  
ServerResponse는 HTTP 응답에의 접근을 제공한다. 불변형이며, build 메서드로 생성한다. 빌더를 사용하여 응답 상태를 설정하고 응답 헤더를 추가하거나 본문을 작성한다. 다음 예제는 200(OK) 응답을 JSON 컨텐츠로 생성한다:  
  

Java

```java
Mono<Person> person = ...
ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).body(person, Person.class);
```

Kotlin

```kotlin
val person: Person = ...
ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(person)
```

  
다음 예제는 201(CREATED) 응답을 Location 헤더와 빈 본문으로 생성한다:  
  

Java

```java
URI location = ...
ServerResponse.created(location).build();
```

Kotlin

```kotlin
val location: URI = ...
ServerResponse.created(location).build()
```

  
사용된 코덱에 따라서 힌트 파라미터를 전달하여 응답 본문이 시리얼라이징 혹은 디시리얼라이징되는 방식을 커스터마이징할 수 있다. 예로, [Jackson JSON view](https://www.baeldung.com/jackson-json-view-annotation)를 지정한다:  
  

Java

```java
ServerResponse.ok().hint(Jackson2CodecSupport.JSON_VIEW_HINT, MyJacksonView.class).body(...);
```

Kotlin

```kotlin
ServerResponse.ok().hint(Jackson2CodecSupport.JSON_VIEW_HINT, MyJacksonView::class.java).body(...)
```

  

#### 핸들러 클래스(Handler Classes)

  
핸들러 함수를 람다로 작성할 수 있다:  
  

Java

```java
HandlerFunction<ServerResponse> helloWorld =
  request -> ServerResponse.ok().bodyValue("Hello World");
```

Kotlin

```kotlin
val helloWorld = HandlerFunction<ServerResponse> { ServerResponse.ok().bodyValue("Hello World") }
```

  
이 방식은 편리하지만 다수의 함수가 필요한 어플리케이션에선 다수의 인라인 람다는 지저분할 수 있다. 때문에 관련된 함수 그룹을 만들어 하나의 핸들러 클래스에 모으는 것이 좋다. 어노테이션 기반 어플리케이션에선 @Controller 클래스가 비슷한 역할을 한다. 예를 들어, 다음 클래스는 리액티브 Person 리파지토리를 노출한다:  
  

Java

```java
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

public class PersonHandler {

    private final PersonRepository repository;

    public PersonHandler(PersonRepository repository) {
        this.repository = repository;
    }

    public Mono<ServerResponse> listPeople(ServerRequest request) { (1)
        Flux<Person> people = repository.allPeople();
        return ok().contentType(APPLICATION_JSON).body(people, Person.class);
    }

    public Mono<ServerResponse> createPerson(ServerRequest request) { (2)
        Mono<Person> person = request.bodyToMono(Person.class);
        return ok().build(repository.savePerson(person));
    }

    public Mono<ServerResponse> getPerson(ServerRequest request) { (3)
        int personId = Integer.valueOf(request.pathVariable("id"));
        return repository.getPerson(personId)
            .flatMap(person -> ok().contentType(APPLICATION_JSON).bodyValue(person))
            .switchIfEmpty(ServerResponse.notFound().build());
    }
}
```

Kotlin

```kotlin
class PersonHandler(private val repository: PersonRepository) {

    suspend fun listPeople(request: ServerRequest): ServerResponse { (1)
        val people: Flow<Person> = repository.allPeople()
        return ok().contentType(APPLICATION_JSON).bodyAndAwait(people);
    }

    suspend fun createPerson(request: ServerRequest): ServerResponse { (2)
        val person = request.awaitBody<Person>()
        repository.savePerson(person)
        return ok().buildAndAwait()
    }

    suspend fun getPerson(request: ServerRequest): ServerResponse { (3)
        val personId = request.pathVariable("id").toInt()
        return repository.getPerson(personId)?.let { ok().contentType(APPLICATION_JSON).bodyValueAndAwait(it) }
                ?: ServerResponse.notFound().buildAndAwait()

    }
}
```

  
(1) `listPeople`은 리파지토리에서 검색한 모든 `Person` 객체를 JSON으로 반환하는 핸들러 함수이다. (2) `createPerson`은 요청 본문에 있는 새 `Person`을 저장하는 핸들러 함수이다. `PersonRepository.savePerson(Person)` 은 `Mono`를 반환한다: 요청에서 `Person`을 읽어 저장하면 빈 `Mono`는 완료 시그널을 발생시킨다. 이 완료 시그널을 받으면(`Person` 저장이 완료되면) `build(Publisher)` 메서드를 사용하여 응답을 보낼 수 있다. (3) `getPerson` 한 `Person`을 반환하는 핸들러 함수이다. `Person`은 경로 변수인 id를 통해 검색된다. 리파지토리에서 `Person`을 검색하고 JSON 응답을 생성한다. 검색된 `Person` 이 없으면 `switchIfEmpty(Mono<T>)`를 사용해 404 Not Found 응답을 반환한다.  
  

#### 밸리데이션

  
함수형 엔드포인트는 스프링의 [밸리데이션 기능](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#validation)을 요청 본문에 적용한다. 예로, Person 에 대한 커스텀 스프링 [Validator](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#validation) 구현체는 다음과 같이 사용한다:  
  

Java

```java
public class PersonHandler {

    private final Validator validator = new PersonValidator(); (1)

    // ...

    public Mono<ServerResponse> createPerson(ServerRequest request) {
        Mono<Person> person = request.bodyToMono(Person.class).doOnNext(this::validate); (2)
        return ok().build(repository.savePerson(person));
    }

    private void validate(Person person) {
        Errors errors = new BeanPropertyBindingResult(person, "person");
        validator.validate(person, errors);
        if (errors.hasErrors()) {
            throw new ServerWebInputException(errors.toString()); (3)
        }
    }
}
```

Kotlin

```kotlin
class PersonHandler(private val repository: PersonRepository) {

    private val validator = PersonValidator() (1)

    // ...

    suspend fun createPerson(request: ServerRequest): ServerResponse {
        val person = request.awaitBody<Person>()
        validate(person) (2)
        repository.savePerson(person)
        return ok().buildAndAwait()
    }

    private fun validate(person: Person) {
        val errors: Errors = BeanPropertyBindingResult(person, "person");
        validator.validate(person, errors);
        if (errors.hasErrors()) {
            throw ServerWebInputException(errors.toString()) (3)
        }
    }
}
```

  
(1) `Validator` 인스턴스를 생성한다. (2) 밸리데이션을 적용한다. (3) 400 응답을 위한 익셉션을 발생시킨다.  
  
핸들러는 LocalValidatorFactoryBean 에 기반한 전역 Validator 인스턴스를 생성하고 주입하여 표준 빈 밸리데이션 API(JSR-303)를 사용할 수 있다. [Spring Validation](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#validation-beanvalidation)을 보라.  
  

## 1.5.3. RouterFunction

라우터 함수를 사용하여 요청을 그에 맞는 HandlerFunction 에 라우팅할 수 있다. 보통 라우터 함수를 직접 작성하지는 않고, RouterFunction 유틸리티 클래스의 메서드로 생성하여 사용한다. RouterFunctions.route()(파라미터 없음) 은 라우터 함수를 생성하기 위한 훌륭한 빌더를 제공하고, RouterFunctions.route(RequestPredicate, HandlerFunction) 는 직접 라우터를 생성하도록 한다.  
  
일반적으로는 route() 빌더 사용을 권장한다. 이 빌더는 전형적인 매핑 시나리오를, 찾기 어려운 정적 임포트 없이 사용할 수 있는 편리하고 간결한 방식으로 제공한다. 예를 들어, 라우터 함수 빌더는 메서드 GET(String, HandlerFunction)으로 GET 요청 매핑을 생성한다. POST 요청 매핑에는 POST(String, HandlerFunction) 가 있다.  
  
HTTP 메서드 기반 매핑 외에도, 이 빌더는 요청에 매핑할 때 추가적인 술어(predicates)를 도입하는 방법을 제공한다. RequestPredicate를 파라미터로 취하는, 각 HTTP 메서드에 대한 과적화된 변종이 존재하지만, 추가 제약조건을 표현할 수 있다.  
  

#### Predicates

  
자신만의 RequestPredicate를 작성할 수 있지만, RequestPredicates 유틸리티 클래스는 요청 경로, HTTP 메서드, 컨텐츠 타입, 그리고 그 외의 것들에 근거하여 공통적으로 사용되는 구현체들을 제공한다. 다음은 요청 술어를 사용하여 Accept 헤더에 기반한 제약조건을 생성한다:  
  

Java

```java
RouterFunction<ServerResponse> route = RouterFunctions.route()
    .GET("/hello-world", accept(MediaType.TEXT_PLAIN),
        request -> ServerResponse.ok().bodyValue("Hello World")).build();
```

Kotlin

```kotlin
val route = coRouter {
    GET("/hello-world", accept(TEXT_PLAIN)) {
        ServerResponse.ok().bodyValueAndAwait("Hello World")
    }
}
```

  
다음을 사용하여 다수의 요청 술어를 함께 구성할 수 있다.

*   RequestPredicate.and(RequestPredicate) - 둘 모두 반드시 매칭.
*   RequestPredicate.or(RequestPredicate) - 하나만 매칭 가능.

  
RequestPredicates 에는 많은 술어가 구성되어 있다. 예를 들어, RequestPredicates.GET(String) 은 RequestPredicates.method(HttpMethod) 와 RequestPredicates.path(String)으로부터 구성되었다. 위 예제는 또한 두 요청 술어를 사용한다. 빌더는 RequestPredicates.GET을 사용하고, accept 술어를 함께 구성한다.  
  

#### Routes

  
라우터 함수는 순서에 따라 평가된다: 첫 번째 라우터에 매칭되지 않으면 두 번째 라우터가 평가되고, 같은 과정을 밟는다. 따라서, 더 구체적인 라우터가 일반적인 라우터에 앞서도록 선언하는 것이 좋다. 유의할 점은, 이 동작은 어노테이션 기반 프로그래밍 모델과는 다르다. 어노테이션 기반 프로그래밍 모델에서는 더 구체적인 컨트롤러 메서드가 자동으로 선택된다.  
  
라우터 함수 빌더를 사용하면, 정의된 모든 라우팅은 하나의 RouterFunction 안에 구성되고, build() 로부터 반환된다. 또한 다수의 라우터 함수를 함께 구성하는 다른 방법들이 있다:

*   RouterFunctions.route() 빌더의 add(RouterFunction)
*   RouterFunction.and(RouterFunction)
*   RouterFunction.andRoute(RequestPredicate, HandlerFunction) - RouterFunction.and() 와 중첩된 RouterFunctions.route() 의 간결한 형태

  
다음은 네 가지 라우팅의 구성을 보여준다:  
  

Java

```java
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.web.reactive.function.server.RequestPredicates.*;

PersonRepository repository = ...
PersonHandler handler = new PersonHandler(repository);

RouterFunction<ServerResponse> otherRoute = ...

RouterFunction<ServerResponse> route = route()
    .GET("/person/{id}", accept(APPLICATION_JSON), handler::getPerson) (1)
    .GET("/person", accept(APPLICATION_JSON), handler::listPeople) (2)
    .POST("/person", handler::createPerson) (3)
    .add(otherRoute) (4)
    .build();
```

Kotlin

```kotlin
import org.springframework.http.MediaType.APPLICATION_JSON

val repository: PersonRepository = ...
val handler = PersonHandler(repository);

val otherRoute: RouterFunction<ServerResponse> = coRouter {  }

val route = coRouter {
    GET("/person/{id}", accept(APPLICATION_JSON), handler::getPerson) (1)
    GET("/person", accept(APPLICATION_JSON), handler::listPeople) (2)
    POST("/person", handler::createPerson) (3)
}.and(otherRoute) (4)
```

  
1) `GET /person/{id}`와 함께 `Accept` 헤더가 JSON에 매칭되면 `PersonHandler.getPerson`으로 라우팅한다 2) `GET /person`와 함께 `Accept` 헤더가 JSON에 매칭되면 `PersonHandler.listPeople`으로 라우팅한다. 3) `POST /person`이 매칭되면 `PersonHandler.createPerson`으로 라우팅한다, 그리고 4) `otherRoute`는 다른 곳에서 생성된 라우터 함수이다. 라우팅에 추가된다.  
  

#### 중첩 라우팅(Nested Routes)

  
라우터 함수 그룹은 술어를 공유하는 것이 일반적이다. 예를 들어 경로를 공유할 수 있다. 위의 예제에서, 공유된 술어는 /person 에 매칭되는 경로 술어가 된다. 이 술어는 세 가지 라우팅에 사용되었다. 어노테이션을 사용할 때는 타입 레벨 @RequestMapping 어노테이션을 /person 과 매핑하여 이런 중복을 제거했다. WebFlux.fn 에서는 경로 술어는 라우터 함수 빌더의 path 메서드를 통해 공유될 수 있다. 예를 들어, 위 예제의 마지막 몇 줄은 중첩 라우팅을 사용하면 다음과 같이 개선된다:  
  

Java

```java
RouterFunction<ServerResponse> route = route()
    .path("/person", builder -> builder (1)
        .GET("/{id}", accept(APPLICATION_JSON), handler::getPerson)
        .GET("", accept(APPLICATION_JSON), handler::listPeople)
        .POST("/person", handler::createPerson))
    .build();
```

Kotlin

```kotlin
val route = coRouter {
    "/person".nest {
        GET("/{id}", accept(APPLICATION_JSON), handler::getPerson)
        GET("", accept(APPLICATION_JSON), handler::listPeople)
        POST("/person", handler::createPerson)
    }
}
```

  
(1) `path`의 두 번째 파라미터는 라우터 빌더를 소비한다.  
  
경로 기반의 중첩이 가장 일반적이기는 하나, 빌더의 nest 메서드를 사용하여 어떠한 종류의 술어든 중첩할 수 있다. 위 예제는 Accept 헤더 술어를 공유하는 형태에서 여전히 중복이 있다. nest 메서드와 accept를 함께 사용하여 더욱 개선할 수 있다:  
  

Java

```java
RouterFunction<ServerResponse> route = route()
    .path("/person", b1 -> b1
        .nest(accept(APPLICATION_JSON), b2 -> b2
            .GET("/{id}", handler::getPerson)
            .GET("", handler::listPeople))
        .POST("/person", handler::createPerson))
    .build();
```

Kotlin

```kotlin
val route = coRouter {
    "/person".nest {
        accept(APPLICATION_JSON).nest {
            GET("/{id}", handler::getPerson)
            GET("", handler::listPeople)
            POST("/person", handler::createPerson)
        }
    }
}
```

  

## 1.5.4. 서버 가동하기

어떻게 HTTP 서버에서 라우터 함수를 가동할까? 다음 중 하나를 사용하여 라우터 함수를 HttpHandler로 컨버팅하는 간단한 옵션이 있다:

*   RouterFunctions.toHttpHandler(RoutherFunction)
*   RouterFunctions.toHttpHandler(RouterFunction, HandlerStrategies)

  
반환된 HttpHandler와 서버 어댑터를 서버 특징적 명령을 위한 [HttpHandler](#121-httphandler)에 따라 사용할 수 있다.  
  
더 일반적인, 또한 스프링 부트에서 사용하는 옵션은 [WebFlux Config](#111-웹플럭스-설정webflux-config)를 통한 [DispatcherHandler](#webflux-dispatcher-handler) 기반 설정을 사용하는 것이다. 이 방법은 스프링 설정을 사용하여 요청 처리에 필요한 컴포넌트를 선언한다. 웹플럭스 자바 설정은 다음의 기반 컴포넌트를 선언하여 함수형 엔드포인트를 지원한다:

*   RouterFunctionMapping: 스프링 설정에서 하나 이상의 RouterFunction 빈을 감지하고, RouterFunction.andOther를 통해 이 빈들을 결합한다. 그리고 이 결과로 구성된 RouterFunction 에 요청을 라우팅한다.
*   HandlerFunctionAdapter: DispatcherHandler가 요청에 매핑된 HandlerFunction을 실행하도록 하는 단순한 어댑터이다.
*   ServerResponseResultHandler: ServerResponse의 writeTo 메서드를 통해 HandlerFunction을 실행한 결과를 핸들링한다.

  
위의 컴포넌트들은 함수형 엔드포인트가 DispatcherHandler 요청 처리 라이프싸이클 안에서 적절하게 작동하도록 한다. 그리고(잠재적으로) 어노테이티드 컨트롤러가 선언되어 있다면 여기에서도 함께 동작하도록 한다. 이것이 스프링 부트 웹플럭스 스타터가 함수형 엔드포인트를 적용하는 방식이다.  
  
다음 예제는 웹플럭스 자바 설정을 보여준다(동작 방식에 관하여는 [DispatcherHandler](#webflux-dispatcher-handler)를 보라):  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Bean
    public RouterFunction<?> routerFunctionA() {
        // ...
    }

    @Bean
    public RouterFunction<?> routerFunctionB() {
        // ...
    }

    // ...

    @Override
    public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
        // configure message conversion...
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // configure CORS...
    }

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        // configure view resolution for HTML rendering...
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    @Bean
    fun routerFunctionA(): RouterFunction<*> {
        // ...
    }

    @Bean
    fun routerFunctionB(): RouterFunction<*> {
        // ...
    }

    // ...

    override fun configureHttpMessageCodecs(configurer: ServerCodecConfigurer) {
        // configure message conversion...
    }

    override fun addCorsMappings(registry: CorsRegistry) {
        // configure CORS...
    }

    override fun configureViewResolvers(registry: ViewResolverRegistry) {
        // configure view resolution for HTML rendering...
    }
}
```

  

## 1.5.5. 핸들러 함수 필터링(Filtering Handler Functions)

라우팅 함수 빌더의 before, after, filter 메서드를 사용하여 핸들러 함수를 필터링할 수 있다. 어노테이션을 사용할 때는 @ControllerAdvice 또는 @ServerFilter, 혹은 둘 모두를 통해 비슷한 기능을 구현할 수 있다. 필터는 해당 빌더가 생성한 모든 라우팅에 적용된다. 이는 중첩 라우팅 안에 선언된 필터는 최상위 레벨 라우팅에 적용되지 않음을 의미한다. 예를 들어, 다음 예제를 보자:  
  

Java

```java
RouterFunction<ServerResponse> route = route()
    .path("/person", b1 -> b1
        .nest(accept(APPLICATION_JSON), b2 -> b2
            .GET("/{id}", handler::getPerson)
            .GET("", handler::listPeople)
            .before(request -> ServerRequest.from(request) (1)
                .header("X-RequestHeader", "Value")
                .build()))
        .POST("/person", handler::createPerson))
    .after((request, response) -> logResponse(response)) (2)
    .build();
```

Kotlin

```kotlin
val route = router {
    "/person".nest {
        GET("/{id}", handler::getPerson)
        GET("", handler::listPeople)
        before { (1)
            ServerRequest.from(it)
                    .header("X-RequestHeader", "Value").build()
        }
        POST("/person", handler::createPerson)
        after { _, response -> (2)
            logResponse(response)
        }
    }
}
```

  
(1) 커스텀 요청 헤더를 추가하는 `before` 필터는 두 GET 라우팅에만 적용된다. (2) 응답 로깅을 수행하는 `after` 필터는 중첩 라우팅을 포함한 모든 라우팅에 적용된다.  
  
라우터 빌더의 filter 메서드는 HandlerFilterFunction을 아규먼트로 갖는다: HandlerFilterFunction은 ServerRequest와 HandlerFunction을 가지고 ServerResponse를 반환한다. 핸들러 함수 파라미터는 체인의 다음 요소를 나타낸다. 일반적으로 다음 요소는 라우팅 대상 핸들러가 되지만, 다수의 필터를 적용할 때는 다른 필터가 될 수도 있다.  
  
다음 예제는 간단한 보안 필터를 라우팅에 추가한다. SecurityManager는 특정 경로에의 접근 허용 여부를 결정한다:  
  

Java

```java
SecurityManager securityManager = ...

RouterFunction<ServerResponse> route = route()
    .path("/person", b1 -> b1
        .nest(accept(APPLICATION_JSON), b2 -> b2
            .GET("/{id}", handler::getPerson)
            .GET("", handler::listPeople))
        .POST("/person", handler::createPerson))
    .filter((request, next) -> {
        if (securityManager.allowAccessTo(request.path())) {
            return next.handle(request);
        }
        else {
            return ServerResponse.status(UNAUTHORIZED).build();
        }
    })
    .build();
```

Kotlin

```kotlin
val securityManager: SecurityManager = ...

val route = router {
        ("/person" and accept(APPLICATION_JSON)).nest {
            GET("/{id}", handler::getPerson)
            GET("", handler::listPeople)
            POST("/person", handler::createPerson)
            filter { request, next ->
                if (securityManager.allowAccessTo(request.path())) {
                    next(request)
                }
                else {
                    status(UNAUTHORIZED).build();
                }
            }
        }
    }
```

  
위 예제는 next.handle(ServerRequest) 실행이 선택적임을 보여준다. 핸들러 함수는 접근이 허용된 경우에만 실행된다.  
  
라우터 함수 빌더의 filter 함수 사용 외에도, RouterFunction.filter(HandlerFunction) 을 통해 기존 라우터 함수에 필터링을 적용할 수 있다.  
  
> 함수형 엔드포인트에의 CORS 지원은 여기에 특화된 CorsWebFilter를 통해 제공한다.  
  

## 1.6.1. URI 링크

이 섹션은 스프링 프레임워크의 URI 에 대한 다양한 옵션에 대해 다룬다.  
  

## 1.6.1. UriComponents

UriComponentsBuilder는 변수를 사용한 URI 템플릿으로부터의 URI 빌드를 제공한다. 다음은 그 예제이다:  
  

Java

```java
UriComponents uriComponents = UriComponentsBuilder
        .fromUriString("https://example.com/hotels/{hotel}")  (1)
        .queryParam("q", "{q}")  (2)
        .encode() (3)
        .build(); (4)

URI uri = uriComponents.expand("Westin", "123").toUri();  (5)
```

Kotlin

```kotlin
val uriComponents = UriComponentsBuilder
        .fromUriString("https://example.com/hotels/{hotel}")  (1)
        .queryParam("q", "{q}")  (2)
        .encode() (3)
        .build() (4)

val uri = uriComponents.expand("Westin", "123").toUri()  (5)
```

  
(1) URI 템플릿을 지정하는 스태틱 팩토리 메서드이다. (2) URI 컴포넌트를 추가하거나 교체한다. (3) URI 템플릿과 URI 변수를 인코딩한다. (4) `UriComponents`를 빌드한다. (5) 변수를 추가하고 URI를 얻는다.  
  
위 예제는 buildAndExpand로 하나의 체인으로 통합하여 더 간결하게 만들 수 있다:  
  

Java

```java
URI uri = UriComponentsBuilder
        .fromUriString("https://example.com/hotels/{hotel}")
        .queryParam("q", "{q}")
        .encode()
        .buildAndExpand("Westin", "123")
        .toUri();
```

Kotlin

```kotlin
val uri = UriComponentsBuilder
        .fromUriString("https://example.com/hotels/{hotel}")
        .queryParam("q", "{q}")
        .encode()
        .buildAndExpand("Westin", "123")
        .toUri()
```

  
(인코딩이 적용된) URI로 직접 이동하여 더 단축할 수 있다:  
  

Java

```java
URI uri = UriComponentsBuilder
        .fromUriString("https://example.com/hotels/{hotel}")
        .queryParam("q", "{q}")
        .build("Westin", "123");
```

Kotlin

```kotlin
val uri = UriComponentsBuilder
        .fromUriString("https://example.com/hotels/{hotel}")
        .queryParam("q", "{q}")
        .build("Westin", "123")
```

  
완전한 URI 템플릿으로 여기서 더 단축할 수 있다:  
  

Java

```java
URI uri = UriComponentsBuilder
        .fromUriString("https://example.com/hotels/{hotel}?q={q}")
        .build("Westin", "123");
```

Kotlin

```kotlin
val uri = UriComponentsBuilder
        .fromUriString("https://example.com/hotels/{hotel}?q={q}")
        .build("Westin", "123")
```

  

## 1.6.2. UriBuilder

[UriComponentsBuilder](#web-uricomponents)는 UriBuilder를 구현한다. UriBuilderFactory를 사용하여 UriBuilder를 생성할 수 있다. 그리고 UriBuilderFactory와 UriBuilder는 URI 템플릿으로부터 베이스 URL, 인코딩, 기타 세부적인 사항과 같은 공유되는 설정을 바탕으로 URI를 빌드하는 장착형(pluggable) 메커니즘을 제공한다.  
  
UriBuilderFactory를 사용하여 RestTemplate, WebClient를 설정하고 URI 준비 과정을 커스터마이징할 수 있다. DefaultUriBuilderFactory는 내부적으로 UriComponentsBuilder를 사용하고 공유되는 설정 옵션을 노출하는 UriBuilderFactory의 기본 구현체이다.  
  
다음은 RestTemplate 설정 방법이다:  
  

Java

```java
// import org.springframework.web.util.DefaultUriBuilderFactory.EncodingMode;

String baseUrl = "https://example.org";
DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(baseUrl);
factory.setEncodingMode(EncodingMode.TEMPLATE_AND_VALUES);

RestTemplate restTemplate = new RestTemplate();
restTemplate.setUriTemplateHandler(factory);
```

Kotlin

```kotlin
// import org.springframework.web.util.DefaultUriBuilderFactory.EncodingMode

val baseUrl = "https://example.org"
val factory = DefaultUriBuilderFactory(baseUrl)
factory.encodingMode = EncodingMode.TEMPLATE_AND_VALUES

val restTemplate = RestTemplate()
restTemplate.uriTemplateHandler = factory
```

  
다음 예제는 WebClient 설정 방법이다:  
  

Java

```java
// import org.springframework.web.util.DefaultUriBuilderFactory.EncodingMode;

String baseUrl = "https://example.org";
DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(baseUrl);
factory.setEncodingMode(EncodingMode.TEMPLATE_AND_VALUES);

WebClient client = WebClient.builder().uriBuilderFactory(factory).build();
```

Kotlin

```kotlin
// import org.springframework.web.util.DefaultUriBuilderFactory.EncodingMode

val baseUrl = "https://example.org"
val factory = DefaultUriBuilderFactory(baseUrl)
factory.encodingMode = EncodingMode.TEMPLATE_AND_VALUES

val client = WebClient.builder().uriBuilderFactory(factory).build()
```

  
추가로, DefaultBuilderFactory를 직접 사용할 수 있다: UriComponentsBuilder를 사용하는 것과 비슷하지만, 이는 스태틱 팩토리 메서드 대신, 설정을 담은 실제 인스턴스이다. 다음은 그 예제이다:  
  

Java

```java
String baseUrl = "https://example.com";
DefaultUriBuilderFactory uriBuilderFactory = new DefaultUriBuilderFactory(baseUrl);

URI uri = uriBuilderFactory.uriString("/hotels/{hotel}")
        .queryParam("q", "{q}")
        .build("Westin", "123");
```

Kotlin

```kotlin
val baseUrl = "https://example.com"
val uriBuilderFactory = DefaultUriBuilderFactory(baseUrl)

val uri = uriBuilderFactory.uriString("/hotels/{hotel}")
        .queryParam("q", "{q}")
        .build("Westin", "123")
```

  

## 1.6.3. URI 인코딩(URI Encoding)

UriComponentsBuilder는 두 가지 레벨의 인코딩 옵션을 노출한다:

*   [UriComponentsBuilder#encode()](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/util/UriComponentsBuilder.html#encode--): URI 템플릿을 먼저 인코딩하고, URI 변수를 적용 시에 인코딩한다.
*   [UriComponents#encode()](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/util/UriComponents.html#encode--): URI 컴포넌트를 URI 변수가 추가된 뒤에 인코딩한다.

  
이 두 옵션은 아스키가 아닌 잘못된 문자를 이스케이핑한 8진수로 대체한다. 그런데 첫 번째 옵션은 문자를 URI 변수가 의미하는 예약 문자로 대체한다.  
  
> ":"를 생각해보자. 경로 문자열에서는 유효한 문자이지만, 동시에 예약 문자이기도 하다. 첫 번째 옵션은 URI 변수의 ":"를 "%3B" 로 대체하지만, URI 템플릿에선 대체하지 않는다. 이와 반대로 두 번째 옵션은 ":"를 절대 대체하지 않는다. 왜냐하면 이 문자는 경로 문자열에서 유효한 문자이기 때문이다.  
  
대부분의 경우, 기대하는 결과를 가져오는 쪽은 첫 번째 옵션이다. 왜냐하면 이 옵션은 URI 변수를 불분명한 데이터 완전한 인코딩 대상으로 취급하기 때문이다. 두 번째 옵션이 유용한 경우는 URI 변수에 의도적으로 예약 문자가 포함된 경우 뿐이다.  
  
다음은 첫 번째 옵션 예제이다:  
  

Java

```java
URI uri = UriComponentsBuilder.fromPath("/hotel list/{city}")
        .queryParam("q", "{q}")
        .encode()
        .buildAndExpand("New York", "foo+bar")
        .toUri();

// Result is "/hotel%20list/New%20York?q=foo%2Bbar"
```

Kotlin

```kotlin
val uri = UriComponentsBuilder.fromPath("/hotel list/{city}")
        .queryParam("q", "{q}")
        .encode()
        .buildAndExpand("New York", "foo+bar")
        .toUri()

// Result is "/hotel%20list/New%20York?q=foo%2Bbar"
```

  
(인코딩이 적용된) URI로 직접 이동하여 더 단축할 수 있다:  
  

You can shorten the preceding example by going directly to the URI (which implies encoding), as the following example shows:

Java

```java
URI uri = UriComponentsBuilder.fromPath("/hotel list/{city}")
        .queryParam("q", "{q}")
        .build("New York", "foo+bar")
```

Kotlin

```kotlin
val uri = UriComponentsBuilder.fromPath("/hotel list/{city}")
        .queryParam("q", "{q}")
        .build("New York", "foo+bar")
```

  
완전한 URI 템플릿으로 여기서 더 단축할 수 있다:  
  

Java

```java
URI uri = UriComponentsBuilder.fromPath("/hotel list/{city}?q={q}")
        .build("New York", "foo+bar")
```

Kotlin

```kotlin
val uri = UriComponentsBuilder.fromPath("/hotel list/{city}?q={q}")
        .build("New York", "foo+bar")
```

  
WebClient와 RestTemplate는 UriBuilderFactory 전략을 통해 URI 템플릿을 내부적으로 적용하고 인코딩한다. 이 둘 모두 커스터마이징 전략으로 설정할 수 있다. 다음은 그 예제이다:  
  

Java

```java
String baseUrl = "https://example.com";
DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(baseUrl)
factory.setEncodingMode(EncodingMode.TEMPLATE_AND_VALUES);

// Customize the RestTemplate..
RestTemplate restTemplate = new RestTemplate();
restTemplate.setUriTemplateHandler(factory);

// Customize the WebClient..
WebClient client = WebClient.builder().uriBuilderFactory(factory).build();
```

Kotlin

```kotlin
val baseUrl = "https://example.com"
val factory = DefaultUriBuilderFactory(baseUrl).apply {
    encodingMode = EncodingMode.TEMPLATE_AND_VALUES
}

// Customize the RestTemplate..
val restTemplate = RestTemplate().apply {
    uriTemplateHandler = factory
}

// Customize the WebClient..
val client = WebClient.builder().uriBuilderFactory(factory).build()
```

  
DefaultBuilderFactory 구현체는 내부적으로 UriComponentsBuilder를 사용하여 URI 템플릿을 적용하고 인코딩한다. 이 구현체는 팩토리로서 아래 인코딩 모드 중 하나를 선택하여 인코딩 방식을 설정할 수 있다:

*   TEMPLATE\_AND\_VALUES: 첫 번째 옵션, UriComponentsBuilder#encode()를 사용하여 URI 템플릿을 먼저 인코딩하고 URI 변수를 적용 시에 인코딩한다.
*   VALUES\_ONLY: URI 템플릿은 인코딩하지 않고, UriUtils#encodeUriUriVariables를 사용하여 URI 변수를 템플릿에 적용하기 전에 인코딩한다.
*   URI\_COMPONENTS: 두 번째 옵션, UriComponents#encode()를 사용하여 URI 변수를 적용한 뒤에 URI 컴포넌트를 인코딩한다.
*   NONE: 아무 인코딩도 적용하지 않는다.

  
RestTemplate은 히스토릭한 사유로, 그리고 하위 호환성을 위해 EncodingMode.URI\_COMPONENTS를 설정한다. WebClient는 기본값으로 DefaultUriBuilderFactory를 갖는다. 인코딩 방식은 버전 5.0.x 에선 Encoding.URI\_COMPONENTS 였고, 5.1 에서 EncodingMode.TEMPLATE\_AND\_VALUES로 변경되었다.  
  

## 1.7. CORS

스프링 웹플럭스는 CORS(Cross-Origin Resource Sharing) 을 핸들링한다. 이 섹션은 그 방법을 주제로 한다.  
  

## 1.7.1. 소개

보안상의 이유로, 브라우저는 현재 origin 에서 벗어난 자원에의 AJAX 호출을 금지한다. 예를 들어, 한 탭에 은행 계좌를 열어두고 다른 탭에 evil.com로 접속했다. evil.com의 스크립트는 당신의 인증서로 은행 API 에 AJAX 요청을 보낼 수 없어야 한다 - 잘못된 예로 당신의 계좌에서 돈을 인출할 수 있다!  
  
Cross-Origin Resource Sharing(CORS) 는 [대부분의 브라우저](https://caniuse.com/#feat=cors)가 구현하는 [W3C 명세](https://www.w3.org/TR/cors/)로, IFRAME 또는 JSONP을 사용한 방법이 아닌, 어떤 종류의 크로스도메인 요청을 허용할 것인지 지정하는 더 안전하고 강력한 방법을 사용한다.  
  

## 1.7.2. 처리(Processing)

CORS 명세는 예비, 단순, 실제 요청을 구분한다. CORS의 작동 방식을 배우려면 [이 글](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)이나 명세에서 더 자세한 내용을 볼 수 있다.  
  
스프링 웹플럭스 HandlerMapping 구현체는 CORS를 내장형으로 지원한다. 요청을 핸들러에 성공적으로 매핑한 뒤, HandlerMapping은 주어진 요청과 핸들러에 대한 CORS 설정을 체크하고 다음 동작을 수행한다. 예비 요청은 직접 핸들링하고, 단순 그리고 실제 CORS 요청은 인터셉팅하고, 검증하고, 필요한 CORS 응답 헤더를 설정한다.  
  
크로스오리진 요청(Origin 헤더 존재하며 요청의 host 헤더와 다른 요청) 을 활성화하기 위해서는, 명시적 CORS 설정을 선언해야 한다. 매칭되는 CORS 설정이 존재하지 않으면 예비 요청은 거부된다. CORS 헤더가 추가되지 않은 단순, 실제 CORS 요청은 브라우저에 의해 거부된다.  
  
URL 패턴 기반 CorsConfiguration 매핑을 통해 각 HandlerMapping을 개별적으로 [설정](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/reactive/handler/AbstractHandlerMapping.html#setCorsConfigurations-java.util.Map-)할 수 있다. 대부분의 경우 어플리케이션은 웹플럭스 자바 설정을 사용하여 이런 매핑을 선언한다. 설정 결과는 단일의, 전역 맵으로 모든 HandlerMapping 구현체에 전달된다.  
  
HandlerMapping 레벨의 전역 CORS 설정과 보다 잘 정돈된 핸들러 레벨 CORS 설정을 결합할 수 있다. 예를 들어, 어노테이티드 컨트롤러는 클래스 또는 메서드 레벨 @CrossOrigin을 사용할 수 있다(다른 핸들러는 CorsConfigurationSource를 구현한다).  
  
전역과 지역 설정을 결합하는 규칙은 보통 추가적이다 - 예: 모든 전역 과 지역 설정. allowCredentials와 maxAge 처럼 단일 값만을 받아들이는 어트리뷰트들은 지역 설정이 전역 설정보다 우선한다. 더 자세한 내용은 [CorsConfiguration#combine(CorsConfiguration)](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/cors/CorsConfiguration.html#combine-org.springframework.web.cors.CorsConfiguration-)을 보라.  
  
> 소스 혹은 고급 커스터마이징은 아래를 찾아보자:

*   CorsConfiguraion
*   CorsProcessor, DefaultCorsProcessor
*   AbstractHandlerMapping

  

## 1.7.3. @CrossOrigin

[@CrossOrigin](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/bind/annotation/CrossOrigin.html)은 어노테이티드 컨트롤러 요청에 크로스오리진을 활성화한다. 다음은 그 예제이다:  
  

Java

```java
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin
    @GetMapping("/{id}")
    public Mono<Account> retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public Mono<Void> remove(@PathVariable Long id) {
        // ...
    }
}
```

Kotlin

```kotlin
@RestController
@RequestMapping("/account")
class AccountController {

    @CrossOrigin
    @GetMapping("/{id}")
    suspend fun retrieve(@PathVariable id: Long): Account {
        // ...
    }

    @DeleteMapping("/{id}")
    suspend fun remove(@PathVariable id: Long) {
        // ...
    }
}
```

  
기본적으로 @CrossOrigin은 다음을 허용한다:

*   모든 오리진
*   모든 헤더
*   컨트롤러 메서드에 매핑되는 모든 HTTP 메서드

  
allowedCredentials는 비활성화가 기본값이다. 왜냐하면 민감한 사용자 특징적 정보(쿠키와 CSRF 토큰과 같은)를 노출하는 신뢰 수준을 결정하기 때문이다. 반드시 적재적소에만 사용되어야 한다.  
  
maxAge를 30분으로 설정한다.  
  
@CrossOrigin을 클래스 레벨에 적용하면 컨트롤러의 모든 메서드에 적용된다. 다음 예제는 특정 도메인을 지정하고 maxAge를 한시간으로 설정한다:  
  

Java

```java
@CrossOrigin(origins = "https://domain2.com", maxAge = 3600)
@RestController
@RequestMapping("/account")
public class AccountController {

    @GetMapping("/{id}")
    public Mono<Account> retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public Mono<Void> remove(@PathVariable Long id) {
        // ...
    }
}
```

Kotlin

```kotlin
@CrossOrigin("https://domain2.com", maxAge = 3600)
@RestController
@RequestMapping("/account")
class AccountController {

    @GetMapping("/{id}")
    suspend fun retrieve(@PathVariable id: Long): Account {
        // ...
    }

    @DeleteMapping("/{id}")
    suspend fun remove(@PathVariable id: Long) {
        // ...
    }
}
```

  
@CrossOrigin을 클래스와 메서드 레벨 모두에 적용할 수 있다:  
  

Java

```java
@CrossOrigin(maxAge = 3600) (1)
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin("https://domain2.com") (2)
    @GetMapping("/{id}")
    public Mono<Account> retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public Mono<Void> remove(@PathVariable Long id) {
        // ...
    }
}
```

Kotlin

```kotlin
@CrossOrigin(maxAge = 3600) (1)
@RestController
@RequestMapping("/account")
class AccountController {

    @CrossOrigin("https://domain2.com") (2)
    @GetMapping("/{id}")
    suspend fun retrieve(@PathVariable id: Long): Account {
        // ...
    }

    @DeleteMapping("/{id}")
    suspend fun remove(@PathVariable id: Long) {
        // ...
    }
}
```

  
(1) `@CrossOrigin`을 클래스 레벨에 사용한다. (2) `@CrossOrigin`을 메서드 레벨에 사용한다.  
  

## 1.7.4. 전역 설정

잘 정돈된 컨트롤러 메서드 레벨 설정에 더하여, 전역 CORS 설정이 필요할 수 있다. URL 기반 CorsConfiguration 매핑을 어떠한 HandlerMapping 에나 독립적으로 설정할 수 있다. 그러나 대부분의 어플리케이션에선 웹플럭스 자바 설정을 사용하여 이를 처리한다.  
  
전역 설정은 다음을 활성화한다:

*   모든 오리진
*   모든 헤더
*   GET, HEAD, POST 메서드

  
allowedCredentials는 비활성화가 기본값이다. 왜냐하면 민감한 사용자 특징적 정보(쿠키와 CSRF 토큰과 같은)를 노출하는 신뢰 수준을 결정하기 때문이다. 반드시 적재적소에만 사용되어야 한다.  
  
maxAge를 30분으로 설정한다.  
  
CorsRegistry 콜백을 사용하여 웹플럭스 자바 설정에서 CORS를 활성화할 수 있다. 다음은 그 예제이다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/api/**")
            .allowedOrigins("https://domain2.com")
            .allowedMethods("PUT", "DELETE")
            .allowedHeaders("header1", "header2", "header3")
            .exposedHeaders("header1", "header2")
            .allowCredentials(true).maxAge(3600);

        // Add more mappings...
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun addCorsMappings(registry: CorsRegistry) {

        registry.addMapping("/api/**")
                .allowedOrigins("https://domain2.com")
                .allowedMethods("PUT", "DELETE")
                .allowedHeaders("header1", "header2", "header3")
                .exposedHeaders("header1", "header2")
                .allowCredentials(true).maxAge(3600)

        // Add more mappings...
    }
}
```

  

## 1.7.5. CORS WebFilter

내장된 [CorsWebFilter](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/cors/reactive/CorsWebFilter.html) 사용하여 CORS 지원을 활성화할 수 있다. 이 방식은 [함수형 엔드포인트](#webflux-fn)와 함께 사용하기 적합하다.  
  
> CorsFilter를 스프링 시큐리티와 사용한다면 스프링 시큐리티의 [내장형 CORS 지원](https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#cors)을 유념하라.  
  
CorsWebFilter 빈을 선언하고 CorsConfigurationSource를 빈의 생성자로 전달하여 필터를 설정할 수 있다. 다음은 그 예제이다:  
  

Java

```java
@Bean
CorsWebFilter corsFilter() {

    CorsConfiguration config = new CorsConfiguration();

    // Possibly...
    // config.applyPermitDefaultValues()

    config.setAllowCredentials(true);
    config.addAllowedOrigin("https://domain1.com");
    config.addAllowedHeader("*");
    config.addAllowedMethod("*");

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);

    return new CorsWebFilter(source);
}
```

Kotlin

```kotlin
@Bean
fun corsFilter(): CorsWebFilter {

    val config = CorsConfiguration()

    // Possibly...
    // config.applyPermitDefaultValues()

    config.allowCredentials = true
    config.addAllowedOrigin("https://domain1.com")
    config.addAllowedHeader("*")
    config.addAllowedMethod("*")

    val source = UrlBasedCorsConfigurationSource().apply {
        registerCorsConfiguration("/**", config)
    }
    return CorsWebFilter(source)
}
```

  

## 1.8. 웹 보안(Web Security)

[스프링 시큐리티](https://projects.spring.io/spring-security/) 프로젝트는 웹 어플리케이션을 악의적인 행위로부터 보호하기 위한 방어책을 지원한다. 스프링 시큐리티 레퍼런스 문서를 보라:

*   [WebFlux Security](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#jc-webflux)
*   [WebFlux Test Support](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#test-webflux)
*   [CSRF Protection](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#csrf)
*   [Security Response Headers](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#headers)

  

## 1.9. 뷰 기술(View Technologies)

스프링 웹플럭스의 뷰 기술은 장착형(pluggable)으로 사용할 수 있다. 뷰 기술로 타임리프(Thymeleaf), 프리마커(FreeMarker) 또는 이 외 다른 어떤 것을 사용하느냐는 주로 설정 변경의 문제가 된다. 이 챕터는 이러한 뷰 기술들과 스프링 웹플럭스의 통합에 대해 다루며, 독자는 [뷰 리솔루션](#webflux-viewresolution)에 대해 숙지하고 있음을 전제로 한다.  
  

## 1.9.1. 타임리프(Thymeleaf)

타임리프는 모던 서버 사이드 자바 템플릿 엔진으로, 더블 체킹을 통해 브라우저에서 미리 보여지는 플레인 HTML 템플릿을 강조한다. 이는 서버 구동 없이 작동할 수 있어, 독립적인 UI 템플릿 작업에 매우 유용하다. 타임리프는 광범위한 기능을 제공하고, 활발하게 개발되고 유지보수된다. [타임리프](https://www.thymeleaf.org/) 프로젝트 홈페이지에서 보다 완전한 소개를 볼 수 있다.  
  
타임리프와 스프링 웹플럭스의 통합은 타임리프 프로젝트가 관리한다. 설정은 몇 가지 빈 선언으로 이루어진다. SpringResourceTemplateResolver, SpringWebFluxTemplateEngine, ThymeleafReactiveViewResolver가 그 예이다. 더 자세한 정보는 [타임리프+스프링](https://www.thymeleaf.org/documentation.html) 및 [웹플럭스 통합 선언문](http://forum.thymeleaf.org/Thymeleaf-3-0-8-JUST-PUBLISHED-td4030687.html)을 통해 찾아볼 수 있다.  
  

## 1.9.2. 프리마커(FreeMarker)

[아파치 프리마커](https://freemarker.apache.org/)는 HTML 부터 이메일이나 기타 다른 어떤 종류의 텍스트 아웃풋이든 생성 가능한 템플릿 엔진이다. 스프링 프레임워크는 스프링 웹플럭스와 프리마커 템플릿을 함께 사용하기 위한 내장형 통합을 제공한다.  
  

#### 뷰 설정

  
다음 예제는 프리마커를 뷰 기술로 설정하는 방법을 보여준다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.freeMarker();
    }

    // Configure FreeMarker...

    @Bean
    public FreeMarkerConfigurer freeMarkerConfigurer() {
        FreeMarkerConfigurer configurer = new FreeMarkerConfigurer();
        configurer.setTemplateLoaderPath("classpath:/templates/freemarker");
        return configurer;
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun configureViewResolvers(registry: ViewResolverRegistry) {
        registry.freeMarker()
    }

    // Configure FreeMarker...

    @Bean
    fun freeMarkerConfigurer() = FreeMarkerConfigurer().apply {
        setTemplateLoaderPath("classpath:/templates/freemarker")
    }
}
```

  
위 예제에서와 같이, 템플릿이 저장된 경로를 FreeMarkerConfigurer 에 지정해야 한다. 이런 설정을 바탕으로, 컨트롤러가 뷰 이름 welcome을 반환하면 리졸버는 classpath:/templates/freemarker/welcome.ftl 템플릿을 찾는다.  
  

#### 프리마커 설정

  
FreeMarkerConfigurer 빈에 적절한 프로퍼티를 설정하여 프리마커 'Settings' 와 'SharedVariables' 디렉토리를 프리마커 Configuration 객체(스프링이 관리한다) 에 전달할 수 있다. freemarkerSettings 프로퍼티에는 java.util.Properties 객체를 사용한다. 그리고 freemarkerVariables 프로퍼티에는 java.util.Map을 사용한다. 다음은 FreeMarkerConfigurer 사용 예제이다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    // ...

    @Bean
    public FreeMarkerConfigurer freeMarkerConfigurer() {
        Map<String, Object> variables = new HashMap<>();
        variables.put("xml_escape", new XmlEscape());

        FreeMarkerConfigurer configurer = new FreeMarkerConfigurer();
        configurer.setTemplateLoaderPath("classpath:/templates");
        configurer.setFreemarkerVariables(variables);
        return configurer;
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    // ...

    @Bean
    fun freeMarkerConfigurer() = FreeMarkerConfigurer().apply {
        setTemplateLoaderPath("classpath:/templates")
        setFreemarkerVariables(mapOf("xml_escape" to XmlEscape()))
    }
}
```

  
변수 설정과 Configuration 객체로의 적용에 대한 더 자세한 내용은 프리마커 문서를 보라.  
  

#### 폼 핸들링

  
스프링은 JSP 에서의 사용을 위한 태그 라이브러리를 제공한다. 태그 라이브러리에는 엘리먼트가 있다. 이 엘리먼트는 폼 지원 객체(form-backing objects)로부터 폼에 값을 보여주도록 하고, 웹 혹은 비즈니즈 계층의 Validator의 밸리데이션 실패 결과를 보여준다. 스프링은 프리마커에 대해서도 이와 동일한 기능과 함께, 폼 인풋 엘리먼트를 스스로 생성하는 편리한 매크로를 제공한다.  
  

#### 매크로 바인딩(The Bind Macros)

  
프리마커 매크로의 표준 집합은 spring-webflux.jar 파일에서 관리한다. 때문에 적절하게 설정된 어플리케이션에 언제든 유효하게 사용할 수 있다.  
  
스프링 템플릿 라이브러리(Spring templating libraries)에 정의된 몇몇 매크로는 내부적으로(private) 취급되지만, 매크로 정의에는 이러한 범위 설정(scoping)은 존재하지 않는다. 모든 매크로는 호출 모드와 사용자 템플릿에서 접근할 수 있다(visible). 다음 섹션은 사용자 템플릿 안에서의 직접 매크로 호출에 관하여만 집중적으로 다룬다. 매크로 코드를 직접 보려면 org.springframework.web.reactive.result.view.freemarker 패키지의 spring.ftl 파일을 보자.  
  
바인딩 지원에 관한 추가적인 정보는 스프링 MVC의 [Simple Binding](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-view-simple-binding)에서 찾아볼 수 있다.  
  

#### 폼 매크로

  
스프링의 프리마커 템플릿 폼 매크로 지원에 대한 자세한 내용은 스프링 MVC 문서의 다음 섹션들에서 다룬다.

*   [인풋 매크로](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-views-form-macros)
*   [인풋 필드](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-views-form-macros-input)
*   [셀렉션 필드](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-views-form-macros-select)
*   [HTML 이스케이핑](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-views-form-macros-html-escaping)

  

## 1.9.3. 스크립트 뷰

스프링 프레임워크는 스프링 웹플럭스와 [JSR-223](https://www.jcp.org/en/jsr/detail?id=223) 자바 스트립팅 엔진 위에서 작동하는 템플릿 라이브러리를 함께 사용하기 위한 내장형 통합을 제공한다. 다음 테이블은 여러 스트립트 엔진 테스트를 거친 템플릿 라이브러리를 보여준다:  
  

  

| 스크립팅 라이브러리                                                                            | 스크립팅 엔진                                                                               |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [Handlebars](<https://handlebarsjs.com/>)                                             | [Nashorn](<https://openjdk.java.net/projects/nashorn/>)                               |
| [Mustache](<https://mustache.github.io/>)                                             | [Nashorn](<https://openjdk.java.net/projects/nashorn/>)                               |
| [React](<https://facebook.github.io/react/>)                                          | [Nashorn](<https://openjdk.java.net/projects/nashorn/>)                               |
| [EJS](<https://www.embeddedjs.com/>)                                                  | [Nashorn](<https://openjdk.java.net/projects/nashorn/>)                               |
| [ERB](<https://handlebarsjs.com/>)                                                    | [JRuby](<https://www.jruby.org/>)                                                     |
| [String template](<https://docs.python.org/2/library/string.html#template-strings>)   | [Jython](<https://www.jython.org/>)                                                   |
| [Kotlin Scripting templating](<https://github.com/sdeleuze/kotlin-script-templating>) | [Kotlin](<https://kotlinlang.org/>)                                                   |

  
> 다른 스트립트 엔진과 통합하는 기본 규칙은, 반드시 ScriptEngine와 Invocable 인터페이스를 구현하는 것이다.  
  

#### 요건

  
스크립트 엔진이 클래스패스에 위치해야 한다. 다음은 스크립트 엔진 종류에 따라 달라지는 상세 내용이다:

*   [Nashorn](https://openjdk.java.net/projects/nashorn/) 자바스크립트 엔진은 자바 8+ 을 요구한다. 가장 최근의 업데이트 릴리즈를 사용할 것을 강력히 권고한다.
*   루비 지원을 위해 [JRuby](https://www.jruby.org/) 의존성을 추가해야 한다.
*   파이썬 지원을 위해 [Jython](https://www.jython.org/) 의존성을 추가해야 한다.
*   코틀린 지원을 위해 org.jetbrains.kotlin:kotlin-script-util의존성과 org.jetbrains.kotlin.script.jsr223.KotlinJsr223JvmLocalScriptEngineFactory 라인을 포함하는 META-INF/services/javax.script.ScriptEngineFactory 파일을 추가해야 한다. 이 [예제](https://github.com/sdeleuze/kotlin-script-templating)에서 자세히 알아볼 수 있다.

스크립트 템플릿 라이브러리가 필요하다. 자바스크립트를 위한 한 가지 방법으로 [WebJars](https://www.webjars.org/)가 있다.  
  

#### 스크립트 템플릿

  
ScriptTemplateConfigurer를 선언하여 사용할 스트립트 엔진, 불러올 스크립트 파일, 어떤 함수를 호출하여 템플릿을 렌더링할지, 그리고 그 외의 것들을 지정할 수 있다. 다음 예제는 Mustache 템플릿 엔진과 Nashorn 자바스크립트 엔진들 사용한다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.scriptTemplate();
    }

    @Bean
    public ScriptTemplateConfigurer configurer() {
        ScriptTemplateConfigurer configurer = new ScriptTemplateConfigurer();
        configurer.setEngineName("nashorn");
        configurer.setScripts("mustache.js");
        configurer.setRenderObject("Mustache");
        configurer.setRenderFunction("render");
        return configurer;
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun configureViewResolvers(registry: ViewResolverRegistry) {
        registry.scriptTemplate()
    }

    @Bean
    fun configurer() = ScriptTemplateConfigurer().apply {
        engineName = "nashorn"
        setScripts("mustache.js")
        renderObject = "Mustache"
        renderFunction = "render"
    }
}
```

  
render 함수는 다음의 파라미터로 호출한다:

*   String template: 템플릿 컨텐츠
*   Map model: 뷰 모델
*   RenderingContext renderingContext: [RenderingContext](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/servlet/view/script/RenderingContext.html)는 어플리케이션 컨텍스트, 로케일, 템플릿 로더, URL(버전 5.0 부터) 에의 접근을 제공한다.

  
Mustache.render() 는 이 시그니처와 선천적인 호환성을 지니기 때문에, 직접 호출할 수도 있다.  
  
사용할 뷰 기술에 커스터마이징이 필요할 경우, 커스텀 render 함수를 구현하는 스크립트를 제공할 수 있다. 예를 들어, [Handlerbars](https://handlebarsjs.com/)는 사용하기에 앞서 템플릿을 컴파일해야 하고, 서버 사이드 스크립트 엔진에서 사용할 수 없는 브라우저 기능을 에뮬레이팅하기 위해 [polyfill](https://en.wikipedia.org/wiki/Polyfill)을 필요로 한다. 다음 예제는 커스텀 render 함수를 설정한다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.scriptTemplate();
    }

    @Bean
    public ScriptTemplateConfigurer configurer() {
        ScriptTemplateConfigurer configurer = new ScriptTemplateConfigurer();
        configurer.setEngineName("nashorn");
        configurer.setScripts("polyfill.js", "handlebars.js", "render.js");
        configurer.setRenderFunction("render");
        configurer.setSharedEngine(false);
        return configurer;
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun configureViewResolvers(registry: ViewResolverRegistry) {
        registry.scriptTemplate()
    }

    @Bean
    fun configurer() = ScriptTemplateConfigurer().apply {
        engineName = "nashorn"
        setScripts("polyfill.js", "handlebars.js", "render.js")
        renderFunction = "render"
        isSharedEngine = false
    }
}
```

  
> 쓰레드세이프하지 않은 스크립트 엔진과 동시성을 고려하여 제작되지 않은 템플릿 라이브러리를 함께 사용할 때는 sharedEngine 프로퍼티를 false로 설정해야 한다. Nashorn 위에서 구동되는 Handlebars, React가 그렇다. 이런 경우에 대해서는 Java SE 8 update 60 이 필요하다. [이 버그](https://bugs.openjdk.java.net/browse/JDK-8076099)가 이유인데, 사실 일반적으로 어떤 경우이든 최신 Java SE 패치 릴리즈를 사용하는 것을 권장한다.  
  
polyfill.js은 Handlebars가 제대로 작동하기 위해 필요한 window 객체만을 정의한다. 다음은 그 스니펫이다:  
  

```javascript
var window = {};
```

  
이 기본 render.js 구현체는 템플릿 엔진을 컴파일하여 사용한다. 준비된 구현체 생성물은 캐싱된 템플릿이나 사전에 컴파일된 템플릿으로 저장하고 재사용하여야 한다. 이 작업은 스크립트사이드에서 이루어지며, 또한 필요에 따라 어떠한 커스터마이징이든 가능하다(템플릿 엔진 설정 관리를 예로 들 수 있다). 다음 예제는 템플릿을 컴파일한다:  
  

```javascript
function render(template, model) {
    var compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(model);
}
```

  
더 많은 설정 예제는 스프링 프레임워크 유닛 테스트, [Java](https://github.com/spring-projects/spring-framework/tree/master/spring-webflux/src/test/java/org/springframework/web/reactive/result/view/script) 그리고 [resources](https://github.com/spring-projects/spring-framework/tree/master/spring-webflux/src/test/resources/org/springframework/web/reactive/result/view/script)를 체크아웃하여 얻을 수 있다.  
  

## 1.9.4. JSON 과 XML

[컨텐츠 협상](#컨텐츠-협상)을 고려할 때, 클라이언트 요청 컨텐츠 타입에 따라 모델 렌더링을 HTML 템플릿이나 다른 포맷(JSON 또는 XML 과 같은) 사이에서 다르게 처리할 수 있도록 하는 것이 좋다. 이런 기능을 지원하기 위해서 스프링 웹플럭스는 HttpMessageWriterView를 제공한다. 이 컴포넌트는 Jackson2JsonEncoder, Jackson2SmileEncoder, 또는 Jaxb2XmlEncoder와 같은, spring-web 에서 유효한 어떠한 [코덱](#125-코덱)에든 추가하여 사용할 수 있다.  
  
다른 뷰 기술과는 다르게, HttpMessageWriterView는 ViewResolver를 필요로 하지 않고, 대신 기본 뷰로 [설정](#111-웹플럭스-설정webflux-config-view-resolvers)한다. 여러 종류의 HttpMessageWriter 또는 Encoder 인스턴스를 래핑하여 하나 이상의 기본 뷰를 설정할 수 있다. 런타임에 요청 컨텐츠 타입에 매칭되는 뷰가 사용된다.  
  
대부분의 경우 모델은 다수의 어트리뷰트를 갖는다. HttpMessageWriterView를 렌더링에 사용할 모델 어트리뷰트 이름과 함께 설정하여 시리얼라이징 대상 어트리뷰트를 결정할 수 있다. 모델이 가진 어트리뷰트가 하나라면, 그 하나를 사용한다.  
  

## 1.10. HTTP 캐싱(HTTP Caching)

HTTP 캐싱은 웹 어플리케이션의 성능을 대폭 향상시킬 수 있다. HTTP 캐싱은 Cache-Control 응답 헤더와 Last-Modified, ETag 과 같은, 이어지는 조건 요청 헤더를 중심으로 작동한다. Cache-Control은 프라이빗(예: 브라우저), 퍼블릭(예: 프록시) 캐시를 어떻게 캐싱하고 응답에 재사용할지 권고한다. ETag 헤더를 사용하여 변경되지 않은 컨텐츠에 대해 304(NOT\_MODIFIED) 본문 없는 응답을 내보내는 조건을 만든다. ETag는 Last-Modified 헤더의 보다 정교한 대체제가 된다.  
  
이 섹션은 스프링 웹플럭스에서 사용 가능한 HTTP 캐싱과 관련된 옵션에 대해 다룬다.  
  

## 1.10.1. CacheControl

CacheControl은 Cache-Control 헤더와 관련된 설정을 제공하고, 다양한 곳에서 아규먼트로 사용할 수 있다:

*   [컨트롤러](#webflux-caching-etag-lastmodified)
*   [정적 자원](#webflux-caching-static-resources)

  
[RFC 7234](https://tools.ietf.org/html/rfc7234#section-5.2.2)는 Cache-Control 응답 헤더를 위한 모든 가능한 디렉티브를 기술한다. CacheControl 타입은 다음과 같이 공통된 시나리오에 맞춘, 유스케이스 지향적인(use case-oriented) 방법을 취한다:  
  

Java

```java
// Cache for an hour - "Cache-Control: max-age=3600"
CacheControl ccCacheOneHour = CacheControl.maxAge(1, TimeUnit.HOURS);

// Prevent caching - "Cache-Control: no-store"
CacheControl ccNoStore = CacheControl.noStore();

// Cache for ten days in public and private caches,
// public caches should not transform the response
// "Cache-Control: max-age=864000, public, no-transform"
CacheControl ccCustom = CacheControl.maxAge(10, TimeUnit.DAYS).noTransform().cachePublic();
```

Kotlin

```kotlin
// Cache for an hour - "Cache-Control: max-age=3600"
val ccCacheOneHour = CacheControl.maxAge(1, TimeUnit.HOURS)

// Prevent caching - "Cache-Control: no-store"
val ccNoStore = CacheControl.noStore()

// Cache for ten days in public and private caches,
// public caches should not transform the response
// "Cache-Control: max-age=864000, public, no-transform"
val ccCustom = CacheControl.maxAge(10, TimeUnit.DAYS).noTransform().cachePublic()
```

  

## 1.10.2. 컨트롤러

컨트롤러는 HTTP 캐싱 지원 요소를 명시적으로 추가할 수 있다. 자원의 lastModified 혹은 ETag 값은 조건부 요청 해더와 비교하기 전에 계산되어야 하기 때문에, 이 방법을 사용할 것을 권한다. 컨트롤러는 ETag와 Cache-Control 설정을 ResponseEntit 에 추가할 수 있다:  
  

Java

```java
@GetMapping("/book/{id}")
public ResponseEntity<Book> showBook(@PathVariable Long id) {

    Book book = findBook(id);
    String version = book.getVersion();

    return ResponseEntity
            .ok()
            .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
            .eTag(version) // lastModified is also available
            .body(book);
}
```

Kotlin

```kotlin
@GetMapping("/book/{id}")
fun showBook(@PathVariable id: Long): ResponseEntity<Book> {

    val book = findBook(id)
    val version = book.getVersion()

    return ResponseEntity
            .ok()
            .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
            .eTag(version) // lastModified is also available
            .body(book)
}
```

  
위 예제는 조건부 요청 헤더와의 비교 결과 컨텐츠가 변경되지 않았음이 확인되면 304(NOT\_MODIFIED) 응답과 빈 본문을 전송한다. 그렇지 않으면 ETag와 Cache-Control 헤더를 응답에 추가해 보낸다.  
  
컨트롤러의 조건부 요청 헤더 체크를 다음과 같이 만들 수도 있다:  
  

Java

```java
@RequestMapping
public String myHandleMethod(ServerWebExchange exchange, Model model) {

    long eTag = ... (1)

    if (exchange.checkNotModified(eTag)) {
        return null; (2)
    }

    model.addAttribute(...); (3)
    return "myViewName";
}
```

Kotlin

```kotlin
@RequestMapping
fun myHandleMethod(exchange: ServerWebExchange, model: Model): String? {

    val eTag: Long = ... (1)

    if (exchange.checkNotModified(eTag)) {
        return null(2)
    }

    model.addAttribute(...) (3)
    return "myViewName"
}
```

  
(1) 어플리케이션 특징적 계산. (2) 304(NOT\_MODIFIED) 응답 설정. 더 이상의 처리는 없다. (3) 요청 처리.  
  
조건부 요청에 대한 eTag, lastModified 값 체크에는 세 가지 변형이 있다. 조건부 GET 과 HEAD 요청에는 304(NOT\_MODIFIED)를 설정한다. POST, PUT, DELETE 에는 409(PRECONDITION\_FAILED)를 설정하여 동시 변경을 방지한다.  
  

## 1.10.3. 정적 자원

정적 자원을 Cache-Control 과 조건부 응답 헤더와 함께 제공하여 성능 최적화를 도모할 수 있다. [정적 자원](#1118-정적-자원static-resources) 설정하기 센셕을 보라.  
  

## 1.11 웹플럭스 설정(WebFlux Config)

웹플럭스 자바 설정은 어노테이티드 컨트롤러 혹은 함수형 엔드로인트로 요청을 처리하기 위해 필요한 컴포넌트를 선언하고, 설정을 커스터마이징하기 위한 API를 제공한다. 이는 자바 설정으로 생성되는 기반 빈을 이해할 필요가 없다는 의미이다. 하지만 기반 빈을 이해하고 싶다면 WebFluxConfigurationSupport을 보거나, 혹은 [스페셜 빈 타입](#13-dispatcherhandler)에서 필요한 내용을 읽어보자.  
  
더 고급의 커스터마이징을 위해서는 설정 API가 아닌 [고급 설정 모드](#111-웹플럭스-설정webflux-config-advanced-java)를 통한 전체 설정 관리가 필요하다.  
  

## 1.11.1. 웹플럭스 설정 활성화(Enabling WebFlux Config)

@EnableWebFlux를 자바 설정에 추가한다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig {
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig
```

  
위 예제는 스프링 웹플럭스의 다양한 [인프라스트럭처 빈](#13-dispatcherhandler)을 등록하고 클래스에서 유효한 의존성을 묶는다 - JSON, XML, 기타 등등.  
  

## 1.11.2. 웹플럭스 설정 API(WebFlux config API)

자바 설정에 WebFluxConfigurer 인터페이스를 구현할 수 있다. 다음은 그 예제이다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    // Implement configuration methods...
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    // Implement configuration methods...
}
```

  

## 1.11.3. 컨버젼, 포맷팅(Conversion, formatting)

@NumberFormat, @DateTimeFormat을 통해 Number, Date 타입 포맷터는 기본적으로 지원한다. 클래스패스에 Joda-Time 이 존재할 경우 Joda-Time 포맷팅 라이브러리를 위한 완전한 지원도 제공한다.  
  
다음 예제는 커스텀 포맷터와 컨버터 등록 방법을 보여준다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        // ...
    }

}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun addFormatters(registry: FormatterRegistry) {
        // ...
    }
}
```

  
> FormatterRegistrar 구현체를 언제 사용할지에 관한 더 자세한 내용은 [FormatterRegistrar SPI](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#format-FormatterRegistrar-SPI)와 FormattingConversionServiceFactoryBean을 보라.  
  

## 1.11.4. 밸리데이션(Validation)

[빈 벨리데이션](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#validation-beanvalidation-overview)이 클래스패스에 존재할 경우(예: 하이버네이트 밸리데이터), 기본적으로 LocalValidatorFactoryBean 이 전역 [밸리데이터](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#validator)로 등록되어 @Valid, Validated를 @Controller 메서드의 아규먼트로 사용할 수 있다.  
  
자바 설정에서 전역 Validator 인스턴스를 커스터마이징할 수 있다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public Validator getValidator(); {
        // ...
    }

}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun getValidator(): Validator {
        // ...
    }

}
```

  
Validator 구현체를 지역적으로 등록하는 것 또한 가능하다:  
  

Java

```java
@Controller
public class MyController {

    @InitBinder
    protected void initBinder(WebDataBinder binder) {
        binder.addValidators(new FooValidator());
    }

}
```

Kotlin

```kotlin
@Controller
class MyController {

    @InitBinder
    protected fun initBinder(binder: WebDataBinder) {
        binder.addValidators(FooValidator())
    }
}
```

  
> 어딘가에 LocalValidatorFactoryBean을 주입해야 한다면, 빈을 생성하고 @Primary를 사용하면 MVC 설정에서 선언된 빈과의 충돌을 회피할 수 있다.  
  

## 1.11.5. 컨텐츠 타입 리졸버(Content Type Resolvers)

스프링 웹플럭스가 @Controller 인스턴스로 요청된 미디어 타입을 결정하는 방법을 설정할 수 있다. 기본적으로 Accept 헤더만을 체크하지만, 쿼리 파라미터 기반의 체크도 가능하다.  
  
다음은 요청된 컨텐츠 타입 리솔루션 커스터마이징 예제이다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void configureContentTypeResolver(RequestedContentTypeResolverBuilder builder) {
        // ...
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun configureContentTypeResolver(builder: RequestedContentTypeResolverBuilder) {
        // ...
    }
}
```

  

## 1.11.6. HTTP 메시지 코덱(HTTP message codecs)

다음 예제는 요청과 응답 본문을 읽고 작성하는 방법을 커스터마이징하는 방법을 보여준다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
        // ...
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun configureHttpMessageCodecs(configurer: ServerCodecConfigurer) {
        // ...
    }
}
```

  
ServerCodecConfigurer는 디폴트 readers와 writers 집합을 제공한다. ServerCodecConfigurer를 사용하여 reader와 writer를 추가하고 디폴트를 커스터마이징하거나 다른 것으로 교체할 수 있다.  
  
Jackson JSON, XML 사용에 대해서는 Jackson2ObjectMapperBuilder 사용을 고려하라. Jackson의 디폴트 프로퍼티를 다음 중 하나로 커스터마이징할 수 있다:

*   [DeserializationFeature.FAIL\_ON\_UNKNOWN\_PROPERTIES](https://fasterxml.github.io/jackson-databind/javadoc/2.6/com/fasterxml/jackson/databind/DeserializationFeature.html#FAIL_ON_UNKNOWN_PROPERTIES)을 무효화한다.
*   [MapperFeature.DEFAULT\_VIEW\_INCLUSION](https://fasterxml.github.io/jackson-databind/javadoc/2.6/com/fasterxml/jackson/databind/MapperFeature.html#DEFAULT_VIEW_INCLUSION)을 무효화한다.

  
또한, 다음의 잘 알려진 모듈들 중, 클래스패스에 존재하는 것을 자동으로 감지하여 등록한다:

*   [jackson-datatype-joda](https://github.com/FasterXML/jackson-datatype-joda): Joda-Time 타입 지원.
*   [jackson-datatype-jsr310](https://github.com/FasterXML/jackson-datatype-jsr310): 자바 8 Date, Time API 타입 지원.
*   [jackson-datatype-jdk8](https://github.com/FasterXML/jackson-datatype-jdk8): Optional 과 같은, 자바 8 타입 지원.
*   [jackson-module-kotlin](https://github.com/FasterXML/jackson-module-kotlin): 코틀린 클래스와 데이터 클래스 지원.

  

## 1.11.7. 뷰 리졸버(View Resolvers)

다음 예제는 뷰 리졸버 설정을 보여준다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        // ...
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun configureViewResolvers(registry: ViewResolverRegistry) {
        // ...
    }
}
```

  
ViewResolverRegistry는 스프링 프레임워크와 통합된 뷰 기술을 위한 간단한 등록 방법을 제공한다. 다음 예제는 프리마커를 사용한다(기반 프리마커 뷰 기술 설정이 요구됨).  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {


    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.freeMarker();
    }

    // Configure Freemarker...

    @Bean
    public FreeMarkerConfigurer freeMarkerConfigurer() {
        FreeMarkerConfigurer configurer = new FreeMarkerConfigurer();
        configurer.setTemplateLoaderPath("classpath:/templates");
        return configurer;
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun configureViewResolvers(registry: ViewResolverRegistry) {
        registry.freeMarker()
    }

    // Configure Freemarker...

    @Bean
    fun freeMarkerConfigurer() = FreeMarkerConfigurer().apply {
        setTemplateLoaderPath("classpath:/templates")
    }
}
```

  
또한 다음과 같이 어떠한 ViewResolver 구현체든 등록할 수 있다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {


    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        ViewResolver resolver = ... ;
        registry.viewResolver(resolver);
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun configureViewResolvers(registry: ViewResolverRegistry) {
        val resolver: ViewResolver = ...
        registry.viewResolver(resolver
    }
}
```

  
[컨텐츠 협상](#컨텐츠-협상)과 뷰 리솔루션을 통한(HTML 이 아닌) 다른 포맷 렌더링 지원을 위해, HttpMessageWriterView 구현체에 기반한 하나 이상의 디폴트 뷰를 설정할 수 있다. HttpMessageWriterView 구현체는 spring-web으로부터 유효한 어느 [코덱](#125-코덱)이든 받아들인다. 다음 예제는 그 설정을 보여준다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {


    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.freeMarker();

        Jackson2JsonEncoder encoder = new Jackson2JsonEncoder();
        registry.defaultViews(new HttpMessageWriterView(encoder));
    }

    // ...
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {


    override fun configureViewResolvers(registry: ViewResolverRegistry) {
        registry.freeMarker()

        val encoder = Jackson2JsonEncoder()
        registry.defaultViews(HttpMessageWriterView(encoder))
    }

    // ...
}
```

  
[뷰 기술](#19-뷰-기술view-technologies)에서 스프링 웹플럭스와 통합된 뷰 기술에 대한 더 자세한 내용을 찾아볼 수 있다.  
  

## 1.11.8. 정적 자원(Static Resources)

이 옵션은 정적 자원을 [Resource](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/core/io/Resource.html) 기반 위치 목록으로부터 서비스하기 위한 편리한 방법을 제공한다.  
  
다음 예제에서 상대경로 /resources로 시작하는 요청은 클래스패스의 /static 경로의 정적 자원을 찾아 서비스한다. 자원의 브라우저 캐싱 유지 기간을 1년으로 설정한다. Last-Modified 헤더가 있을 경우 그 값을 평가하고 304 상태 코드를 반환한다. 다음은 그 예제이다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/resources/**")
            .addResourceLocations("/public", "classpath:/static/")
            .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));
    }

}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry.addResourceHandler("/resources/**")
                .addResourceLocations("/public", "classpath:/static/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS))
    }
}
```

  
자원 핸들러는 [ResourceResolver](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/reactive/resource/ResourceResolver.html), [ResourceTransformer](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/reactive/resource/ResourceTransformer.html) 구현체의 체인을 지원한다. 이 구현체들은 최적화된 자원으로 서비스하기 위한 툴체인을 생성하기 위해 사용된다.  
  
컨텐츠, 어플리케이션 버전 또는 다른 정보로부터 계산된 MD5 해시에 기반하여 버저닝된(versioned) 자원 URL을 위해 VersionResourceResolver를 사용할 수 있다. ContentVersionStrategy(MD5 해시) 는(모듈 로더와 함께 사용되는 자바스크립트 자원과 같은) 몇몇 중요한 예외를 제외하고 좋은 선택이 된다.  
  
다음 예제는 자바 설정에서 VersionResourceResolver를 사용하는 예제이다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/resources/**")
                .addResourceLocations("/public/")
                .resourceChain(true)
                .addResolver(new VersionResourceResolver().addContentVersionStrategy("/**"));
    }

}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry.addResourceHandler("/resources/**")
                .addResourceLocations("/public/")
                .resourceChain(true)
                .addResolver(VersionResourceResolver().addContentVersionStrategy("/**"))
    }

}
```

  
ResourceUrlProvider를 사용하여 URL 재작성(rewrite) 및 리졸버와 트랜스포머 의 완전 체이닝을 적용할 수 있다(예: 버전 입력을 위해). 웹플럭스 설정은 ResourceUrlProvider를 제공하여 이런 컴포넌트들을 다른 곳으로 주입할 수 있도록 한다.  
  
스프링 MVC 와는 달리, 현재 웹플럭스에서는 정적 자원 URL을 투명하게 재작성하는 방법은 없다. 왜냐하면 논 블로킹 리졸버와 트랜스포머 체인을 사용하는 뷰 기술이 존재하지 않기 때문이다. 로컬 자원만을 서비스할 때는 ResourceUrlProvider를 직접 사용하고(예: 커스텀 엘리먼트를 통해) 블로킹 방식을 취하는 것이 대안이 된다.  
  
EncodedResourceResolver(예: Gzip, Brotli) 와 VersionedResourceResolver를 사용할 때는 컨텐츠 기반 버전은 언제나 인코딩된 파일을 기반으로 하도록 반드시 해당 순서로 등록해야 한다.  
  
[WebJars](https://www.webjars.org/documentation)는 WebJarsResourceResolver를 통해 지원된다. WebJarsResourceResolver는 org.webjars:webjars-locator-core 라이브러리가 클래스패스에 존재할 경우 자동으로 등록된다. 이 리졸버는 URL을 재작성하여 jar의 버전을 포함하도록 하고, 버전 없이 들어오는 요청 URL 과 매칭한다. 예를 들어, /jquery/jquery.min.js를 /jquery/1.2.0/jquery.min.js와 매칭한다.  
  

## 1.11.9. 경로 매칭(path Matching)

경로 매칭 관련 옵션을 커스터마이징할 수 있다. 각각의 옵션에 관한 자세한 내용은 [PathMatchConfigurer](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/org/springframework/web/reactive/config/PathMatchConfigurer.html) 자바독을 보라. 다음은 PathMatchConfigurer 예제이다:  
  

Java

```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer
            .setUseCaseSensitiveMatch(true)
            .setUseTrailingSlashMatch(false)
            .addPathPrefix("/api",
                    HandlerTypePredicate.forAnnotation(RestController.class));
    }
}
```

Kotlin

```kotlin
@Configuration
@EnableWebFlux
class WebConfig : WebFluxConfigurer {

    @Override
    fun configurePathMatch(configurer: PathMatchConfigurer) {
        configurer
            .setUseCaseSensitiveMatch(true)
            .setUseTrailingSlashMatch(false)
            .addPathPrefix("/api",
                    HandlerTypePredicate.forAnnotation(RestController::class.java))
    }
}
```

  
> 스프링 웹플럭스는 세미콜론이 제거된 상태에서(경로 혹은 매트릭스 변수) 디코딩된 경로 세그먼트에의 접근을 위해 RequestPath 라 불리는 파싱된 요청 경로 표기에 의존한다. 이는 스프링 MVC 와는 다르게, 경로 매칭 목적으로 요청 경로의 디코딩 여부나 세미콜론의 제거 여부를 표시할 필요가 없음을 의미한다.  
  
스프링 MVC 와는 달리, 스프링 웹플럭스는 접미어 패턴 매칭을 지원하지 않는다. 접미어 패턴에 의존하지 않는 다른 [방법](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-ann-requestmapping-suffix-pattern-match)을 권한다.  
  

## 1.11.10. 고급 설정 모드(Advanced Configutaion Mode)

@EnableWebFlux는 DelegatingWebFluxConfiguration을 임포트한다:

*   웹플럭스 어플리케이션을 위한 디폴트 스프링 설정을 제공한다.
*   WebFluxConfigurer 구현체를 감지하고 위임을 통해 설정을 커스터마이징한다.

  
고급 모드 사용을 위해 @EnableWebFlux를 제거하고 DelegatingWebFluxConfiguration을 직접 확장할 수 있다. WebFluxConfigurer는 구현하지 않는다. 다음은 그 예제이다:  
  

Java

```java
@Configuration
public class WebConfig extends DelegatingWebFluxConfiguration {

    // ...
}
```

Kotlin

```kotlin
@Configuration
class WebConfig : DelegatingWebFluxConfiguration {

    // ...
}
```

  
기존 WebConfig의 메서드를 유지할 수 있지만, 기본 클래스로부터 빈 선언을 오버라이딩할 수도 있으며, 여전히 클래스패스에 WebMvcConfigurer 구현체를 몇 개든 가질 수 있다.  
  

## 1.12. HTTP/2

서블릿 4 컨테이너는 HTTP/2를 지원해야 하고, 스프링 프레임워크 5 는 서블릿 API 4 와 호환된다. 프로그래밍 모델 관점에서는 어플리케이션에 더 해야할 일은 없다. 그러나 서버 설정에 관한 고려사항이 있다. [HTTP/2 위키 페이지](https://github.com/spring-projects/spring-framework/wiki/HTTP-2-support)에서 더 자세한 내용을 찾아볼 수 있다.  
  
스프링 웹플럭스는 현재 네티를 사용한 HTTP/2를 지원하지 않는다. 그리고 프로그래밍 방식 자원 푸싱(pushing)도 지원하지 않는다.  