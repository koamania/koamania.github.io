---
layout: post
comments: false
title: "#5 JPA 실무 - 서비스 및 repository 구현"
date: 2020-06-20
image: '/assets/img/'
description: "서비스 로직 구현과 repository 구현"
main-class: dev
tags: jpa java
categories: "JPA"
introduction: "서비스 로직 구현과 repository 구현"
---
# 동적 쿼리
## if문으로 분기된 아주아주아주아주 복잡스러운 쿼리
```java
Map<String, String> parameters = new HashMap<>();
if (orderSearch.getStatus() != null) {
    if (isFirstCondition) {
        jpql += " where";
    } else {
        jpql += " and";
    }
    jqpl += " o.status = :order";
    parameters.put("order", orderSearch.getStatus());
}
 // ...
```
- 분기 처리가 많아 에러가 날 확률이 높아짐
- 가독성 제로
- 생성된 쿼리가 직관적으로 보이지 않음

## Criteria
```java
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Order> cq = cb.createQuery(Order.class);
Root<Order> o = cq.from(Order.class);
Join<Object, Object> m = o.join("member", JoinType.INNER);

List<Predicate> criteria = new ArrayList<>();

if (orderSearch.getOrderStatus() != null) {
    Predicate status = cb.equal(o.get("status"), orderSearch.getOrderStatus());
    criteria.add(status);
}
// ...
```
- JPA 표준
- 사람이 보라고 만든 쿼리가 아님
- 표준이긴하지만 이해하기가 if문 분기로 된 쿼리보다 더 이해하기 힘듬
## QueryDSL
```
QOrder order = QOrder.order;
QMember member = QMember.member;

return query.select(order)
            .from(order)
            .join(order.member, member)
            .where(statusEq(orderSearch.getOrderStatus()))
            .limit(1000)
            .fetch();
```
- 동적 쿼리가 강력하게 해결 됨.
- 컴파일 시점에 에러를 검출 가능