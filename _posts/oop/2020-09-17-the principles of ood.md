---
layout: post
comments: false
title: "11가지 객체 지향 설계 원칙"
date: 2020-09-17
image: '/assets/img/'
description: "객체 지향 설계 원칙"
color:
tags: oop programming study
category: "oop"
introduction: "객체 지향 설계 시 고려할 11가지 원칙"
---
# 객체 기향 설계 원칙 11가지
> **출처** : <http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod>{:target="_blank"}

객체 지향 설계 시 기본 원칙으로 알려진 SOLID의 경우 클래스 디자인 시 고려해야할 항목이다.
그 외의 패키지, 나아가서 아키텍쳐의 레이어에서의 객체 지향 설계 원칙들이 존재한다.


## 다섯가지 클래스 디자인 원칙(SOLID)


|         |                                                                           |                                                                          |
|---------|---------------------------------------------------------------------------|--------------------------------------------------------------------------|
| **SRP** | [The Single Responsibility Principle][]                                   | *클래스 변경의 이유는 하나여야만 한다.(클래스의 책임은 한가지여야만 한다.)*               |
| **OCP** | [The Open Closed Principle][]                                             | *클래스 동작을 수정하지 않고 확장할 수 있어야 한다.(변하는것과 변하지 않는 것을 구분하라.)* |
| **LSP** | [The Liskov Substitution Principle][]                                     | *파생된 클래스는 기본 클래스로 대체가 가능해야 한다.(하위형은 상위형의 불변조건을 반드시 만족해야 한다.)*          |
| **ISP** | [The Interface Segregation Principle][]                                   | *각 클라이언트는 세밀하게 인터페이스로 분리되어야 함.(기능별로 세밀하게 인터페이스로 추상화 되어야 함.)*                 |
| **DIP** | [The Dependency Inversion Principle][The Interface Segregation Principle] | *구현체가 아닌 추상객체에 의존되어야 함.(구현체는 세부 항목임. 의존하는 객체는 인터페이스에서 제공되는 정보만을 알아야 함.)*                            |

  [The Single Responsibility Principle]: https://drive.google.com/file/d/0ByOwmqah_nuGNHEtcU5OekdDMkk/view
  [The Open Closed Principle]: https://drive.google.com/file/d/0BwhCYaYDn8EgN2M5MTkwM2EtNWFkZC00ZTI3LWFjZTUtNTFhZGZiYmUzODc1/view
  [The Liskov Substitution Principle]: https://drive.google.com/file/d/0BwhCYaYDn8EgNzAzZjA5ZmItNjU3NS00MzQ5LTkwYjMtMDJhNDU5ZTM0MTlh/view
  [The Interface Segregation Principle]: https://drive.google.com/file/d/0BwhCYaYDn8EgOTViYjJhYzMtMzYxMC00MzFjLWJjMzYtOGJiMDc5N2JkYmJi/view


## 패키지 디자인 원칙

|         |                                                                         |                                                         |
|---------|-------------------------------------------------------------------------|---------------------------------------------------------|
| **REP** | [The Release Reuse Equivalency Principle][]                             | *The granule of reuse is the granule of release.*       |
| **CCP** | [The Common Closure Principle][The Release Reuse Equivalency Principle] | *Classes that change together are packaged together.*   |
| **CRP** | [The Common Reuse Principle][The Release Reuse Equivalency Principle]   | *Classes that are used together are packaged together.* |

  [The Release Reuse Equivalency Principle]: https://drive.google.com/file/d/0BwhCYaYDn8EgOGM2ZGFhNmYtNmE4ZS00OGY5LWFkZTYtMjE0ZGNjODQ0MjEx/view

## 패키지 결합 원칙 및 패키지 구조 평가 매트릭

|         |                                                                        |                                                         |
|---------|------------------------------------------------------------------------|---------------------------------------------------------|
| **ADP** | [The Acyclic Dependencies Principle][]                                 | *The dependency graph of packages must have no cycles.* |
| **SDP** | [The Stable Dependencies Principle][]                                  | *Depend in the direction of stability.*                 |
| **SAP** | [The Stable Abstractions Principle][The Stable Dependencies Principle] | *Abstractness increases with stability.*                |

  [The Acyclic Dependencies Principle]: https://drive.google.com/file/d/0BwhCYaYDn8EgOGM2ZGFhNmYtNmE4ZS00OGY5LWFkZTYtMjE0ZGNjODQ0MjEx/view
  [The Stable Dependencies Principle]: https://drive.google.com/file/d/0BwhCYaYDn8EgZjI3OTU4ZTAtYmM4Mi00MWMyLTgxN2YtMzk5YTY1NTViNTBh/view