---
layout: post
comments: false
title: "#0 Infrastructure as code란?"
date: 2019-04-30
image: '/assets/img/'
description: "코드로 인프라 관리하기"
main-class: infra
color:
tags: MSA 인프라 책
category: "MSA"
introduction: "코드로 인프라 관리하기"
---
# Infrastructure as code(IaC)란?

-   인프라 자동화 방법
-   시스템과 구성을 프로비저닝하고 일관되고 반복 가능한 절차를 코드로서 관리하는 방법

## 목표

-   인프라 변경이 장애물이나 제약이 되는 것이 아닌, 손 쉽게 변경을 지원하게 한다.
-   시스템 변경은 스트레스나 고통을 주지 않는 작업이다.
-   인프라 개선 작업은 대규모(Big bang) 프로젝트를 통해서가 아니라, 지속적이며 점진적인 절차를 통해서 개선한다.

## 발생할 수 있는 문제점

-   서버 폭증
-   구성 편차
-   눈송이 서버
-   자동화 공포
-   침식([링크](https://devcenter.heroku.com/articles/erosion-resistance#heroku-is-erosion-resistant))
