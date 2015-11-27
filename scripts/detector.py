__author__ = 'yarden'

import csv
import sqlite3 as sql


CG_DB = 'cg.sqlite'

root = '/Users/yarden/data/cg/topaz'
enc2doc = dict()
values = []


def parse(filename):
    print 'parse ', filename
    with open(root + '/' + filename) as o:
        f = csv.DictReader(o)
        for row in f:

            e = int(row['Encounter'])
            d = int(row['Document Id'])
            if e not in enc2doc or d < enc2doc[e]:
                enc2doc[e] = d


def load(filename):
    print 'load: ', filename
    with open(root + '/' + filename) as o:
        f = csv.DictReader(o)
        for row in f:
            e = int(row['encounter'])
            values.append((1, enc2doc[e], row['posterior_prob_influenza'], row['posterior_prob_nili']))


def update_db(filename):
    print 'update_db', filename
    conn = sql.connect(root+'/'+filename)
    with conn:
        conn.execute('delete from detectors where did = 1')
        conn.executemany('insert into detectors values (?, ?, ?, ?)', values)


parse('CDSCaseMetaData2007.csv')
parse('CDSCaseMetaData2008.csv')
load('slc2007_metadata_diagnosis_topazslc_prob.csv')
load('slc2008_metadata_diagnosis_topazslc_prob.csv')
update_db(CG_DB)