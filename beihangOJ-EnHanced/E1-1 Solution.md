#include <stdio.h>

int main(){
double r;
scanf("%lf",&r);
double pi = 3.14159;
double l = pi * 2.0 * r;
double S = pi * r * r;
printf("%.2lf %.2lf", l, S);
}