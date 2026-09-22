from smartmeasure.estimation.fusion import fuse

def test_prior_pulls_estimate():
    mean, sigma, _=fuse(100.0,0.15,(75,4))
    assert 75< mean< 100 and sigma<4


def test_no_prior_passthrough():
    mean, sigma, _=fuse(80.0,0.1,None)
    assert mean == 80.0 and abs(sigma-8.0)<1e-6