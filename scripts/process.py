__author__ = 'yarden'

from sys import argv
import os
from collections import defaultdict
import csv


tags = dict()
types = defaultdict(int)

temp = dict()

fields = [set() for i in range(5)]

def parse_info(filename):
    return filename[:filename.find('.')]


def parse_file(d, filename):
    enc = parse_info(filename)
    with open(d+'/'+filename) as tsv:
        f = csv.reader(tsv, delimiter='\t')
        for line in f:
            name = line[0]
            type = line[1]
            if name == 'highest measured temperature':
                if line[1] not in temp:
                    temp[line[1]] = True
                    print '[', filename, ']:', line

            if name == 'highest measured temperature':
                if type[:3] == 'low':
                    name = 'low fever'
                    type = 'present'
                elif type[:4] == 'high':
                    name = 'high fever'
                    type = 'present'
                elif type[:15] == 'inconsequential':
                    name = 'inconsequential fever'
                    type = 'present'
                else:
                    print 'unknown temperature type [', line[1], ']'
                    name = 'unknown fever'
                    type = 'present'

            types[type] += 1
            if type == 'present':
                # enc.positive.append(name)
                p, n = 1, 0
            elif type == 'absent':
                # enc.negative.append(name)
                p, n = 0, 1
            else:
                print '*** unknown type:', line

            if name in tags:
                tp, tn = tags[name]
                p, n = p + tp, n + tn
            tags[name] = (p, n)


def parse_all():
    for d in argv[1:]:
        print 'dir:', d
        i = 0
        for name in os.listdir(d):
            i += 1
            if i % 1000 == 0:
                print i
            parse_file(d, name)

# *** Main ***
if len(argv) == 1:
    print 'Usage: ', argv[0], 'dir'
    exit(0)

parse_all()

# print sorted(tags.items());

print 'tag:       ', len(tags)
print '** tags **'
for name, tag in sorted(tags.items()):
    p, n = tag
    print name,':',p, n
# with open('data/tags.csv', 'wb') as csv_file:
#     f = csv.writer(csv_file)
#     for name, tag in sorted(tags.items()):
#         p, n = tag
#         f.writerow([name, p, n])
