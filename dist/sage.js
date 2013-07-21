Traceback (most recent call last):
  File "tools/closure/bin/build/depswriter.py", line 202, in <module>
    main()
  File "tools/closure/bin/build/depswriter.py", line 178, in main
    path_to_source.update(_GetRelativePathToSourceDict(root, prefix=prefix))
  File "tools/closure/bin/build/depswriter.py", line 140, in _GetRelativePathToSourceDict
    os.chdir(root)
OSError: [Errno 2] No such file or directory: '/Users/jaworskm/Development/Git/Sage/build/../src/'
