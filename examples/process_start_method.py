import multiprocessing as mp
if __name__ == '__main__':
    context = mp.get_context('spawn')
    with context.Pool(1) as pool:
        print(pool.map(abs, [-2, 3]))
    print(context.get_start_method())
