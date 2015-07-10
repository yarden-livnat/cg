__author__ = 'yarden'

import csv
import collections

filename = 'data/NLP_Flu_Model_pilot_Results.csv'

finding = collections.defaultdict(int)
cases = collections.defaultdict(int)
positive = 0
negative = 0

with open(filename, 'rU') as f:
    reader = csv.reader(f)
    reader.next()
    for row in reader:
        # print '[', row, ']'
        finding[row[2]] += 1
        cases[row[0]] += 1
        if row[3] == 'T':
            positive += 1
        else:
            negative += 1

n = 0
s = 0
m = 0
for item in finding.items():
    s += item[1]
    m = max(m, item[1])
    n += 1
print 'findings: ', n, s/n, m


n = 0
s = 0
m = 0
for item in cases.items():
    s += item[1]
    m = max(m, item[1])
    n += 1
print 'cases: ', n, s/n, m

print 'pos: ', positive, ' neg:', negative