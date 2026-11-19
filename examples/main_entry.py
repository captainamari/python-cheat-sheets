def main(argv):
    return 0 if argv == ['check'] else 2
if __name__ == '__main__':
    print(main(['check']))
    print(main([]))
