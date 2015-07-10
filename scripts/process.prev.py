__author__ = 'yarden'

from sys import argv
import os
from collections import defaultdict
import re
import csv


encounters = dict()
tags = dict()
types = defaultdict(int)
pattern = re.compile('._ADT(\d+)_REG([^_]+)_ENC(\d+)_DOC(\d+)_AGE([^\.]+)')

fields = [set() for i in range(5)]

class Patient:
    def __init__(self, id):
        self.id = id
        self.age = None


class Encounter:
    def __init__(self, eid, pid):
        self.eid = eid
        self.pit = pid
        self.date = None
        self.reg = None
        self.positive = []
        self.negative = []


def parse_info(filename):
    m = pattern.match(filename)
    date = m.group(1)
    reg = m.group(2)
    eid = m.group(3)
    pid = m.group(4)
    age = m.group(5)

    fields[0].add(date)
    fields[1].add(reg)
    fields[2].add(eid)
    fields[3].add(pid)
    fields[4].add(age)

    if eid in encounters:
        encounter = encounters[eid]
    else:
        encounters[eid] = encounter = Encounter(eid, pid)
        encounter.date = date
        encounter.reg = reg
        encounter.age = age
    return encounter


def parse_file(d, filename):
    enc = parse_info(filename)
    with open(d+'/'+filename) as tsv:
        f = csv.reader(tsv, delimiter='\t')
        for line in f:
            name = line[0]
            type = line[1]
            if name == 'highest measured temperature':
                if type[:3] == 'low':
                    name = 'low fever'
                    type = 'present'
                elif type[:4] == 'high fever':
                    name = 'high fever'
                    type = 'present'
                else:
                    name = 'fever'
                    type = 'absent'
            types[type] += 1
            if type == 'present':
                enc.positive.append(name)
                p, n = 1, 0
            else:
                enc.negative.append(name)
                p, n = 0, 1

            if name in tags:
                tp, tn = tags[name]
                p, n = p + tp, n + tn
            tags[name] = (p, n)


def parse_all():
    for d in argv[1:]:
        for name in os.listdir(d):
            # print name
            parse_file(d, name)

# *** Main ***
if len(argv) == 1:
    print 'Usage: ', argv[0], 'dir'
    exit(0)

parse_all()

dates = sorted(fields[0])
regs = sorted(fields[1])
enc = sorted(fields[2])
docs = sorted(fields[3])
ages = sorted(fields[4])

print 'dates: [', len(dates), '] ', dates[0], dates[len(dates)-1]
print 'regs: [', len(regs), '] ', regs[0], regs[len(regs)-1]
print 'enc: [', len(enc), '] ', enc[0], enc[len(enc)-1]
print 'docs: [', len(docs), '] ', docs[0], docs[len(docs)-1]
print 'ages: [', len(ages), '] ', ages[0], ages[len(ages)-1]


print 'encounters:', len(encounters)
print 'types', types
print 'tag:       ', len(tags)
print '** tags **'
for name, tag in tags.iteritems():
    p, n = tag
    print name,':',p, n